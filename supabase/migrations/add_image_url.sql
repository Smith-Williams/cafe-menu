-- Run in Supabase SQL Editor if image_url column is missing on items

alter table public.items
  add column if not exists image_url text;

comment on column public.items.image_url is 'Public URL for menu item photo (Supabase Storage or external CDN)';
