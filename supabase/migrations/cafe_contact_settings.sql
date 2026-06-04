-- Contact & location fields for cafe_settings (run in Supabase SQL Editor)

alter table public.cafe_settings
  add column if not exists phone_display text,
  add column if not exists phone_tel text,
  add column if not exists whatsapp_number text,
  add column if not exists business_hours text,
  add column if not exists address_ar text,
  add column if not exists maps_url text,
  add column if not exists instagram_url text;

update public.cafe_settings
set
  phone_display = coalesce(phone_display, '+966 50 000 0000'),
  phone_tel = coalesce(phone_tel, '+966500000000'),
  whatsapp_number = coalesce(whatsapp_number, '966500000000'),
  business_hours = coalesce(business_hours, 'يومياً ٧:٣٠ ص – ٩:٠٠ م'),
  address_ar = coalesce(address_ar, 'الرياض — حدّث العنوان من لوحة الإدارة'),
  maps_url = coalesce(maps_url, null),
  instagram_url = coalesce(instagram_url, null)
where id = '00000000-0000-0000-0000-000000000001'::uuid;
