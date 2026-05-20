-- Run after schema.sql in Supabase SQL Editor

-- Singleton cafe branding / theme
create table if not exists public.cafe_settings (
  id int primary key default 1 check (id = 1),
  cafe_name_ar text not null default 'مقهى الدُّفء',
  tagline_ar text default 'قهوة مختصة ومخبوزات طازجة',
  logo_url text,
  primary_color text not null default '#c9a87c',
  accent_color text not null default '#8b6f47',
  currency_code text not null default 'SAR',
  updated_at timestamptz not null default now()
);

insert into public.cafe_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.cafe_settings enable row level security;

create policy "cafe_settings_public_read"
  on public.cafe_settings for select
  using (true);

create policy "cafe_settings_owner_write"
  on public.cafe_settings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Owners can update order status
create policy "orders_owner_update"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Remove duplicate menu rows before unique constraint (keeps oldest id per name+category)
delete from public.items a
using public.items b
where a.id > b.id
  and a.category_id = b.category_id
  and lower(trim(a.name_ar)) = lower(trim(b.name_ar));

create unique index if not exists items_category_name_unique
  on public.items (category_id, lower(trim(name_ar)));

-- Atomic checkout: order + line items in one transaction
create or replace function public.create_order_with_items(
  p_customer_name text,
  p_customer_phone text,
  p_notes text,
  p_total_amount numeric,
  p_lines jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_line jsonb;
begin
  insert into public.orders (customer_name, customer_phone, notes, total_amount, status)
  values (p_customer_name, p_customer_phone, p_notes, p_total_amount, 'pending')
  returning id into v_order_id;

  for v_line in select * from jsonb_array_elements(p_lines)
  loop
    insert into public.order_items (
      order_id,
      menu_item_id,
      quantity,
      unit_price,
      item_name_ar
    )
    values (
      v_order_id,
      nullif(v_line->>'menu_item_id', '')::uuid,
      (v_line->>'quantity')::int,
      (v_line->>'unit_price')::numeric,
      v_line->>'item_name_ar'
    );
  end loop;

  return v_order_id;
end;
$$;

grant execute on function public.create_order_with_items(
  text, text, text, numeric, jsonb
) to anon, authenticated;
