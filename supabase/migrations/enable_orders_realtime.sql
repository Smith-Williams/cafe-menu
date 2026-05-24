-- Enable Supabase Realtime for admin order notifications.
-- Run once in SQL Editor. Also verify: Database → Replication → orders is enabled.

do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.order_items;
exception
  when duplicate_object then null;
end $$;
