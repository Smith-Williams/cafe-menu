-- Run this in Supabase SQL Editor once, then create an Auth user for the owner.
-- After signup, set is_owner = true for that user in profiles.

create extension if not exists "pgcrypto";

-- Profiles (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  is_owner boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read"
  on public.categories for select
  using (true);

create policy "categories_owner_all"
  on public.categories for all
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

-- Menu line items (catalog)
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  name_ar text not null,
  description_ar text,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists items_category_id_idx on public.items (category_id);

alter table public.items enable row level security;

create policy "items_public_read"
  on public.items for select
  using (true);

create policy "items_owner_all"
  on public.items for all
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

-- Orders (customer checkout)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  notes text,
  total_amount numeric(12, 2) not null check (total_amount >= 0),
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders_public_insert"
  on public.orders for insert
  with check (true);

create policy "orders_owner_read"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Order line items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid references public.items (id) on delete set null,
  quantity int not null check (quantity > 0),
  unit_price numeric(12, 2) not null,
  item_name_ar text not null
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "order_items_public_insert"
  on public.order_items for insert
  with check (true);

create policy "order_items_owner_read"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.is_owner = true
    )
  );

-- Cafe branding (singleton row id = 1)
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

create unique index if not exists items_category_name_unique
  on public.items (category_id, lower(trim(name_ar)));

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

-- Auto profile row on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, is_owner)
  values (new.id, false)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Promote your owner (replace USER_UUID after you sign up):
-- update public.profiles set is_owner = true where id = 'USER_UUID';
