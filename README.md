# Binghamton Mineral Explorer

A website for tracking the geology department's campus rocks and department minerals.

- **Campus Rocks:** map of rocks on campus, with a downloadable QR code for each one
- **Department Minerals:** minerals by room, tagged if used for teaching
- **Search**, **log in**, and an **admin page** for approving new accounts

Built with [Next.js](https://nextjs.org) (website) and [Supabase](https://supabase.com) (database, logins, image storage).

---

## First-time setup

### 1. Install the tools
- **Node.js** (LTS version): https://nodejs.org
- **VS Code** (code editor): https://code.visualstudio.com
- **Git**: https://git-scm.com

### 2. Create the database
1. Make a free account at https://supabase.com and click **New project**.
2. In the project, open **SQL Editor → New query**, paste in all of `supabase/schema.sql`, and click **Run**.
   Then do the same, in number order, for each numbered update file in `supabase/`
   (`002_mineral_properties.sql`, and so on).
3. Optional, for easier testing: **Authentication → Sign In / Providers → Email**, turn off **Confirm email** so new accounts work right away. Turn it back on before real launch.

### 3. Connect the website to the database
1. Copy `.env.local.example` to a new file named `.env.local`.
2. In Supabase, open **Project Settings → API** and copy the **Project URL** and the **anon public** key into `.env.local`.

### 4. Set your campus location
Open `lib/config.js` and change `CAMPUS_CENTER` to your campus's latitude and longitude
(right-click your campus in Google Maps to copy them).

### 5. Run it
In a terminal, inside this folder:

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000.

### 6. Make yourself an admin
1. On the website, click **Log in → Sign up** and create your account.
2. In Supabase's SQL Editor, run (with your email):

```sql
update public.profiles set role = 'admin' where email = 'you@example.edu';
```

3. Refresh the website. You'll now see the **+** button and the **Admin** page.

---

## How accounts work

| Role | Can do |
|---|---|
| (not logged in) | Browse campus rocks and department minerals, search |
| `pending` | Same as not logged in, until an admin approves them |
| `student` | Same as not logged in for now (the Teaching page comes later) |
| `instructor` | Add/edit/delete specimens, download QR codes |
| `admin` | Everything, plus approve accounts and change roles on the Admin page |

New sign-ups are always `pending`. Approve them on the **Admin** page.

---

## Putting it online (when ready)

1. Put this folder on GitHub (don't upload `.env.local`; `.gitignore` already excludes it).
2. At https://vercel.com, import the GitHub repository.
3. Add the same three values from `.env.local` as Environment Variables in Vercel, setting
   `NEXT_PUBLIC_SITE_URL` to the real site address. **Set this before printing QR codes**,
   because the codes point to that address.
4. In Supabase, **Authentication → URL Configuration**, set the Site URL to the real address.

---

## Where things are

| File | What it does |
|---|---|
| `supabase/schema.sql` | Database tables, permission rules, image storage |
| `supabase/002_*.sql`, … | Later database changes, run in number order |
| `lib/mineralogy.js` | Crystal system list and formula display (subscripts) |
| `components/SpecimenForm.js` | The add/edit form behind the **+** button |
| `app/rocks/page.js` | Campus Rocks page (map + list) |
| `app/minerals/page.js` | Department Minerals page |
| `app/specimens/[id]/page.js` | A single specimen's page (what QR codes link to) |
| `app/search/page.js` | Search |
| `app/admin/page.js` | Approve accounts and change roles |
| `app/login/page.js` | Log in / sign up |
| `lib/config.js` | Campus map location |
| `app/globals.css` | Colors and layout |
