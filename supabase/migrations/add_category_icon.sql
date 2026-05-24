-- Optional: category emoji/icon for tab UI
alter table public.categories add column if not exists icon text;
