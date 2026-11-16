-- =====================================================================
-- Adds formula, crystal system, and "member of" (mineral group) to specimens.
-- Run once in Supabase: Dashboard -> SQL Editor -> New query.
-- (For a brand-new project: run schema.sql first, then this file.)
-- =====================================================================

alter table public.specimens
  add column formula        text,   -- e.g. SiO2 (digits display as subscripts)
  add column crystal_system text
    check (crystal_system in ('isometric', 'tetragonal', 'hexagonal', 'trigonal',
                              'orthorhombic', 'monoclinic', 'triclinic', 'amorphous')),
  add column member_of      text;   -- e.g. Garnet Group
