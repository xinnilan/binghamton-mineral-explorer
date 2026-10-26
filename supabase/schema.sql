-- =====================================================================
-- Geology Collection database
-- Run this whole file once in Supabase: Dashboard -> SQL Editor -> New query
-- =====================================================================

-- ---------- Types ----------
create type specimen_category as enum ('campus_rock', 'department_mineral');
create type user_role as enum ('pending', 'student', 'instructor', 'admin');

-- ---------- Profiles (one row per user account) ----------
create table public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  email      text,
  full_name  text,
  role       user_role not null default 'pending',
  created_at timestamptz not null default now()
);

-- Every new sign-up automatically gets a profile with role 'pending'.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper functions used by the permission rules below.
create function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('instructor', 'admin') from public.profiles where id = auth.uid()),
    false);
$$;

create function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false);
$$;

-- ---------- Specimens (campus rocks and department minerals) ----------
create table public.specimens (
  id                bigint generated always as identity primary key,
  catalog_number    text unique,                 -- optional ID from the paper records
  name              text not null,
  description       text,                        -- hardness, color, type, etc. all go here
  image_path        text,                        -- file path in the 'specimen-images' bucket
  category          specimen_category not null,

  -- campus rocks only
  latitude          double precision,
  longitude         double precision,
  location_note     text,

  -- department minerals only
  room_number       text,
  used_for_teaching boolean not null default false,

  created_by        uuid references auth.users default auth.uid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger specimens_updated_at
  before update on public.specimens
  for each row execute function public.touch_updated_at();

-- =====================================================================
-- Permissions
-- =====================================================================

alter table public.profiles  enable row level security;
alter table public.specimens enable row level security;

-- Explicit access for the website's logins ('anon' = not logged in,
-- 'authenticated' = logged in). Needed when Supabase's "Automatically expose
-- new tables" setting is off. The policies below still decide which rows
-- each person can actually touch.
grant execute on function public.is_staff(), public.is_admin() to anon, authenticated;
grant select, update, delete on public.profiles to authenticated;
grant select on public.specimens to anon, authenticated;
grant insert, update, delete on public.specimens to authenticated;

-- Profiles: you can see your own; admins can see and change everyone's role.
create policy "read own profile"   on public.profiles for select using (id = auth.uid());
create policy "admins read all"    on public.profiles for select using (public.is_admin());
create policy "admins update role" on public.profiles for update using (public.is_admin());
create policy "admins delete"      on public.profiles for delete using (public.is_admin());

-- Specimens: anyone can see rows; only instructors/admins can add, edit, delete.
create policy "anyone reads rows"  on public.specimens for select using (true);
create policy "staff insert"       on public.specimens for insert with check (public.is_staff());
create policy "staff update"       on public.specimens for update using (public.is_staff());
create policy "staff delete"       on public.specimens for delete using (public.is_staff());

-- =====================================================================
-- Image storage
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('specimen-images', 'specimen-images', true);

create policy "staff upload images" on storage.objects for insert
  with check (bucket_id = 'specimen-images' and public.is_staff());
create policy "staff update images" on storage.objects for update
  using (bucket_id = 'specimen-images' and public.is_staff());
create policy "staff delete images" on storage.objects for delete
  using (bucket_id = 'specimen-images' and public.is_staff());

-- =====================================================================
-- After you sign up on the website for the first time, make yourself
-- an admin by running this (with your email):
--
--   update public.profiles set role = 'admin' where email = 'you@example.edu';
-- =====================================================================
