-- Align categories table for seed.sql + admin (name/name_ar + emoji/icon)
-- Run once in Supabase SQL Editor if seed fails on "null value in column name"

alter table public.categories add column if not exists name text;
alter table public.categories add column if not exists name_ar text;
alter table public.categories add column if not exists emoji text;
alter table public.categories add column if not exists icon text;

update public.categories
set
  name = coalesce(nullif(trim(name), ''), name_ar),
  name_ar = coalesce(nullif(trim(name_ar), ''), name),
  emoji = coalesce(nullif(trim(emoji), ''), icon),
  icon = coalesce(nullif(trim(icon), ''), emoji);
