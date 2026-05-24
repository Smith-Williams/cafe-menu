-- EVA Coffee sample menu (run after schema.sql + migrations)
-- Safe to re-run: uses fixed category UUIDs and upserts by name per category

alter table public.categories add column if not exists icon text;

-- Fixed category ids for idempotent seeding
insert into public.categories (id, name_ar, sort_order, icon)
values
  ('11111111-1111-1111-1111-111111111101', 'مشروبات ساخنة', 1, '☕'),
  ('11111111-1111-1111-1111-111111111102', 'مشروبات باردة', 2, '🧊'),
  ('11111111-1111-1111-1111-111111111103', 'طعام ومخبوزات', 3, '🥐')
on conflict (id) do update set
  name_ar = excluded.name_ar,
  sort_order = excluded.sort_order,
  icon = excluded.icon;

-- Remove duplicate items with same name in same category (keeps one)
delete from public.items a
using public.items b
where a.id > b.id
  and a.category_id = b.category_id
  and lower(trim(a.name_ar)) = lower(trim(b.name_ar));

-- Hot drinks
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111101'::uuid, 'إسبريسو كلاسيك', 'قهوة مركزة غنية بطبقة كريما ذهبية', 12.00, 'https://images.unsplash.com/photo-1510591509098-8fa17c0c8b0e?w=800&q=80', 1),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'كابتشينو', 'إسبريسو مع حليب مبخر ورغوة حريرية', 16.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e4d1?w=800&q=80', 2),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'لاتيه فانيلا', 'لاتيه ناعم بنكهة فانيلا طبيعية', 18.00, 'https://images.unsplash.com/photo-1561882468-8940e9a164b8?w=800&q=80', 3),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'أمريكانو', 'إسبريسو ممدود — خفيف ونظيف', 14.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 4),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'موكا بالشوكولاتة', 'إسبريسو مع شوكولاتة بلجيكية وحليب', 20.00, 'https://images.unsplash.com/photo-1577896851231-70ef188817f0?w=800&q=80', 5),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'شاي ماسالا', 'خليط توابل هندية مع حليب مبخر', 15.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80', 6),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'قهوة تركية', 'محضرة في cezve تقليدية', 13.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', 7),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'فلات وايت', 'إسبريسو مع حليب ميكروفوم ناعم', 17.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80', 8)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- Cold drinks
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111102'::uuid, 'آيس لاتيه', 'لاتيه بارد على الثلج', 18.00, 'https://images.unsplash.com/photo-1517701604599-b5d4d1a3b8c0?w=800&q=80', 1),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'كولد برو', 'قهوة باردة منقوعة ١٨ ساعة', 16.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&q=80', 2),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'فرابيه كراميل', 'مخفوق بارد مع صوص كراميل', 22.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80', 3),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'ليموناضة بالنعناع', 'منعشة وطبيعية', 14.00, 'https://images.unsplash.com/photo-1523672890803-1a5c4e9e0a0e?w=800&q=80', 4),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'آيس موكا', 'شوكولاتة وإسبريسو على الثلج', 21.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80', 5),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'ماتشا لاتيه بارد', 'ماتشا يابانية مع حليب', 19.00, 'https://images.unsplash.com/photo-1515823064-d6e0f004aeca?w=800&q=80', 6),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'عصير برتقال طازج', 'عصير يومي طازج', 12.00, 'https://images.unsplash.com/photo-1622597467836-f9a748f9c0e0?w=800&q=80', 7),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'موهيتو توت', 'توت بري مع نعناع وصودا', 17.00, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80', 8)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- Food
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111103'::uuid, 'كروسان زبدة', 'مخبوز يومياً — مقرمش من الخارج', 14.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80', 1),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'براوني شوكولاتة', 'شوكولاتة داكنة ٧٠٪', 16.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80', 2),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'تشيز كيك بيري', 'كريمة جبن مع توت موسمي', 22.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80', 3),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'توست أفوكادو', 'خبز حبوب كاملة مع أفوكادو وبيض', 24.00, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&q=80', 4),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'ساندويتش جبن مشوي', 'جبن شيدر على خبز محمص', 20.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&q=80', 5),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'سلطة سيزر', 'خس روماني مع صوص بيتي', 18.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80', 6),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'مافن توت أزرق', 'طري ومحشو بالتوت', 12.00, 'https://images.unsplash.com/photo-1607958996333-41efef572d0d?w=800&q=80', 7),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'وافل بلجيكي', 'مع عسل القيقب وموز', 19.00, 'https://images.unsplash.com/photo-1562376552-0d160a2b2380?w=800&q=80', 8)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);
