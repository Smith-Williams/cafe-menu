-- EVA Coffee — full menu with curated photos (Unsplash CDN)
-- Safe to re-run: skips duplicate names; updates images for all listed items

alter table public.categories add column if not exists icon text;
alter table public.items add column if not exists image_url text;

insert into public.categories (id, name_ar, sort_order, icon)
values
  ('11111111-1111-1111-1111-111111111101', 'مشروبات ساخنة', 1, '☕'),
  ('11111111-1111-1111-1111-111111111102', 'مشروبات باردة', 2, '🧊'),
  ('11111111-1111-1111-1111-111111111103', 'مخبوزات ووجبات', 3, '🥐'),
  ('11111111-1111-1111-1111-111111111104', 'حلويات', 4, '🍰'),
  ('11111111-1111-1111-1111-111111111105', 'إفطار', 5, '🍳')
on conflict (id) do update set
  name_ar = excluded.name_ar,
  sort_order = excluded.sort_order,
  icon = excluded.icon;

update public.categories
set name_ar = 'مخبوزات ووجبات', icon = '🥐'
where id = '11111111-1111-1111-1111-111111111103'
  and name_ar in ('طعام ومخبوزات', 'مخبوزات ووجبات خفيفة');

delete from public.items a
using public.items b
where a.id > b.id
  and a.category_id = b.category_id
  and lower(trim(a.name_ar)) = lower(trim(b.name_ar));

-- مشروبات ساخنة
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111101'::uuid, 'إسبريسو كلاسيك', 'قهوة مركزة بطبقة كريما ذهبية', 12.00, 'https://images.unsplash.com/photo-1510591509098-8fa17c0c8b0e?w=800&h=600&fit=crop&q=85', 1),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'كابتشينو', 'إسبريسو مع حليب مبخر ورغوة حريرية', 16.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e4d1?w=800&h=600&fit=crop&q=85', 2),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'لاتيه', 'إسبريسو مع حليب مبخر — ناعم ومتوازن', 18.00, 'https://images.unsplash.com/photo-1561882468-8940e9a164b8?w=800&h=600&fit=crop&q=85', 3),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'لاتيه فانيلا', 'لاتيه بنكهة فانيلا طبيعية', 19.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop&q=85', 4),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'أمريكانو', 'إسبريسو ممدود — خفيف ونظيف', 14.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop&q=85', 5),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'موكا بالشوكولاتة', 'إسبريسو مع شوكولاتة بلجيكية وحليب', 20.00, 'https://images.unsplash.com/photo-1577896851231-70ef188817f0?w=800&h=600&fit=crop&q=85', 6),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'فلات وايت', 'إسبريسو مع حليب ميكروفوم ناعم', 17.00, 'https://images.unsplash.com/photo-1511927573907-edd13e140083?w=800&h=600&fit=crop&q=85', 7),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'كورتادو', 'إسبريسو مع حليب دافئ بنسبة متساوية', 16.00, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop&q=85&sat=-10', 8),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'ماكياتو', 'إسبريسو مع قطرة حليب رغوية', 13.00, 'https://images.unsplash.com/photo-1521302269716-7a313a7b4e3e?w=800&h=600&fit=crop&q=85', 9),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'ريستريتو', 'جرعة إسبريسو مركزة جداً', 11.00, 'https://images.unsplash.com/photo-1510591509098-8fa17c0c8b0e?w=800&h=600&fit=crop&q=85&con=15', 10),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'قهوة تركية', 'محضرة في إبريق تقليدي', 13.00, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&q=85', 11),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'شاي ماسالا', 'توابل هندية مع حليب مبخر', 15.00, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop&q=85', 12),
  ('11111111-1111-1111-1111-111111111101'::uuid, 'شوكولاتة ساخنة', 'كاكاو فاخر مع حليب مخفوق', 17.00, 'https://images.unsplash.com/photo-1542991923-27c781ef1f0e?w=800&h=600&fit=crop&q=85', 13)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- مشروبات باردة
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111102'::uuid, 'آيس لاتيه', 'لاتيه بارد على الثلج', 18.00, 'https://images.unsplash.com/photo-1517701604599-b5d4d1a3b8c0?w=800&h=600&fit=crop&q=85', 1),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'كولد برو', 'قهوة باردة منقوعة ١٨ ساعة', 16.00, 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop&q=85', 2),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'آيس أمريكانو', 'إسبريسو بارد ممدود على الثلج', 15.00, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop&q=85&brightness=1.05', 3),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'فرابيه كراميل', 'مخفوق بارد مع صوص كراميل', 22.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=600&fit=crop&q=85', 4),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'آيس موكا', 'شوكولاتة وإسبريسو على الثلج', 21.00, 'https://images.unsplash.com/photo-1579440907930-028f1c02e46b?w=800&h=600&fit=crop&q=85', 5),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'ماتشا لاتيه بارد', 'ماتشا يابانية مع حليب بارد', 19.00, 'https://images.unsplash.com/photo-1515823064-d6e0f004aeca?w=800&h=600&fit=crop&q=85', 6),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'ليموناضة بالنعناع', 'منعشة وطبيعية', 14.00, 'https://images.unsplash.com/photo-1621263765818-1fd1b17918de?w=800&h=600&fit=crop&q=85', 7),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'عصير برتقال طازج', 'عصير يومي طازج', 12.00, 'https://images.unsplash.com/photo-1622597467836-f9a748f9c0e0?w=800&h=600&fit=crop&q=85', 8),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'سموذي فراولة', 'فراولة طازجة مع زبادي', 18.00, 'https://images.unsplash.com/photo-1553530666-ba11a7da8558?w=800&h=600&fit=crop&q=85', 9),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'موهيتو توت', 'توت بري مع نعناع وصودا', 17.00, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop&q=85', 10),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'عصير مانجو', 'مانجو استوائي منعش', 16.00, 'https://images.unsplash.com/photo-1600271886742-f371fbb8b6d8?w=800&h=600&fit=crop&q=85', 11),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'شاي مثلج خوخ', 'شاي أسود بارد بنكهة خوخ', 13.00, 'https://images.unsplash.com/photo-1558168476-d86c9e8f83dc?w=800&h=600&fit=crop&q=85', 12),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'مياه معدنية', '٥٠٠ مل', 3.00, 'https://images.unsplash.com/photo-1548839140-29a43e5be958?w=800&h=600&fit=crop&q=85', 13)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- مخبوزات ووجبات
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111103'::uuid, 'كروسان زبدة', 'مخبوز يومياً — مقرمش من الخارج', 14.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop&q=85', 1),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'رول قرفة', 'قرفة وسكر مع صوص كريمي', 13.00, 'https://images.unsplash.com/photo-1558961363-fa37fdbc2b12?w=800&h=600&fit=crop&q=85', 2),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'باغل بالجبن', 'باغل محمص مع جبنة كريمية', 15.00, 'https://images.unsplash.com/photo-1551182891-681a7d1f0e0e?w=800&h=600&fit=crop&q=85', 3),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'توست أفوكادو', 'خبز حبوب كاملة مع أفوكادو وبيض', 24.00, 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop&q=85', 4),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'ساندويتش جبن مشوي', 'جبن شيدر على خبز محمص', 20.00, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop&q=85', 5),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'سلطة سيزر', 'خس روماني مع صوص بيتي', 18.00, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop&q=85', 6),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'مافن توت أزرق', 'طري ومحشو بالتوت', 12.00, 'https://images.unsplash.com/photo-1607958996333-41efef572d0d?w=800&h=600&fit=crop&q=85', 7),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'وافل بلجيكي', 'مع عسل القيقب وموز', 19.00, 'https://images.unsplash.com/photo-1562376552-0d160a2b2380?w=800&h=600&fit=crop&q=85', 8),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'كوكيز الشوكولاتة', 'قطعتان — شوكولاتة رقائق', 10.00, 'https://images.unsplash.com/photo-1499636136210-6f4eee915583?w=800&h=600&fit=crop&q=85', 9),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'براوني شوكولاتة', 'شوكولاتة داكنة ٧٠٪', 16.00, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop&q=85', 10),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'تشيز كيك بيري', 'كريمة جبن مع توت موسمي', 22.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop&q=85', 11),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'ساندويتش ديك رومي', 'ديك رومي مدخن مع خس وطماطم', 21.00, 'https://images.unsplash.com/photo-1509722747047-dc9e12c9a744?w=800&h=600&fit=crop&q=85', 12)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- حلويات
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111104'::uuid, 'تيراميسو', 'طبقات ماسكاربوني وإسبريسو', 23.00, 'https://images.unsplash.com/photo-1571877227200-7d38b9bc0a0e?w=800&h=600&fit=crop&q=85', 1),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'كيك شوكولاتة', 'كيكة غنية بطبقات كريمة', 20.00, 'https://images.unsplash.com/photo-1578985545062-c303585a0f80?w=800&h=600&fit=crop&q=85', 2),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'كرواسون شوكولاتة', 'كرواسون محشو بشوكولاتة', 15.00, 'https://images.unsplash.com/photo-1623334044303-241a4526c81e?w=800&h=600&fit=crop&q=85', 3),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'ماكرون فرنسي', 'تشكيلة ٣ حبات بألوان متنوعة', 18.00, 'https://images.unsplash.com/photo-1569864358642-9d1b1c4e8b0e?w=800&h=600&fit=crop&q=85', 4),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'آيس كريم فانيلا', 'كرتان — فانيلا بلجيكية', 14.00, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop&q=85', 5),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'بافلوفا توت', 'مرنغ هش مع كريمة وتوت', 21.00, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop&q=85', 6),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'دونات محشوة', 'دونات بصوص كريمة', 12.00, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop&q=85', 7),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'كريم بروليه', 'كسترد كراميل مقرمش', 19.00, 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop&q=85', 8),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'تشيز كيك نيويورك', 'كلاسيكي كثيف وكريمي', 22.00, 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&h=600&fit=crop&q=85', 9),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'موس شوكولاتة', 'شوكولاتة داكنة خفيفة', 17.00, 'https://images.unsplash.com/photo-1624354476848-1ecb4f4f9a44?w=800&h=600&fit=crop&q=85', 10)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- إفطار
insert into public.items (category_id, name_ar, description_ar, price, image_url, available, sort_order)
select v.category_id, v.name_ar, v.description_ar, v.price, v.image_url, true, v.sort_order
from (values
  ('11111111-1111-1111-1111-111111111105'::uuid, 'بيض بنديكت', 'بيض مسلوق مع صوص هولنديز', 28.00, 'https://images.unsplash.com/photo-1482049016669-50faeba9caff?w=800&h=600&fit=crop&q=85', 1),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'بان كيك كلاسيك', '٣ قطع مع عسل وزبدة', 22.00, 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7440?w=800&h=600&fit=crop&q=85', 2),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'توست فرنسي', 'خبز محلى مع قرفة وسكر', 20.00, 'https://images.unsplash.com/photo-1484727325834-9566d6d0e0e0?w=800&h=600&fit=crop&q=85', 3),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'شكشوكة', 'بيض في صلصة طماطم حارة', 24.00, 'https://images.unsplash.com/photo-1590412201908-48c9f1c0f1c0?w=800&h=600&fit=crop&q=85', 4),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'أومليت خضار', 'بيض مع فلفل وسبانخ وجبن', 21.00, 'https://images.unsplash.com/photo-1525358824349-400b814ede0e?w=800&h=600&fit=crop&q=85', 5),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'بول granola', 'زبادي مع جرانولا وتوت', 19.00, 'https://images.unsplash.com/photo-1517686469429-9bbb095e1f1a?w=800&h=600&fit=crop&q=85', 6),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'فطور إنجليزي', 'بيض، سجق، فاصوليا، توست', 32.00, 'https://images.unsplash.com/photo-1525358824349-400b814ede0e?w=800&h=600&fit=crop&q=85&sat=15', 7),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'سموذي بول', 'موز، توت، عسل، حليب', 18.00, 'https://images.unsplash.com/photo-1511690740660-5852f4a042ca?w=800&h=600&fit=crop&q=85&sat=10', 8)
) as v(category_id, name_ar, description_ar, price, image_url, sort_order)
where not exists (
  select 1 from public.items i
  where i.category_id = v.category_id and lower(trim(i.name_ar)) = lower(trim(v.name_ar))
);

-- Sync photos for items that already exist (re-run safe)
update public.items i
set image_url = v.image_url
from (values
  ('إسبريسو كلاسيك', 'https://images.unsplash.com/photo-1510591509098-8fa17c0c8b0e?w=800&h=600&fit=crop&q=85'),
  ('كابتشينو', 'https://images.unsplash.com/photo-1572442388796-11668a67e4d1?w=800&h=600&fit=crop&q=85'),
  ('لاتيه', 'https://images.unsplash.com/photo-1561882468-8940e9a164b8?w=800&h=600&fit=crop&q=85'),
  ('لاتيه فانيلا', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop&q=85'),
  ('أمريكانو', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop&q=85'),
  ('موكا بالشوكولاتة', 'https://images.unsplash.com/photo-1577896851231-70ef188817f0?w=800&h=600&fit=crop&q=85'),
  ('فلات وايت', 'https://images.unsplash.com/photo-1511927573907-edd13e140083?w=800&h=600&fit=crop&q=85'),
  ('كورتادو', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&h=600&fit=crop&q=85&sat=-10'),
  ('ماكياتو', 'https://images.unsplash.com/photo-1521302269716-7a313a7b4e3e?w=800&h=600&fit=crop&q=85'),
  ('ريستريتو', 'https://images.unsplash.com/photo-1510591509098-8fa17c0c8b0e?w=800&h=600&fit=crop&q=85&con=15'),
  ('قهوة تركية', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop&q=85'),
  ('شاي ماسالا', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop&q=85'),
  ('شوكولاتة ساخنة', 'https://images.unsplash.com/photo-1542991923-27c781ef1f0e?w=800&h=600&fit=crop&q=85'),
  ('آيس لاتيه', 'https://images.unsplash.com/photo-1517701604599-b5d4d1a3b8c0?w=800&h=600&fit=crop&q=85'),
  ('كولد برو', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800&h=600&fit=crop&q=85'),
  ('آيس أمريكانو', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop&q=85&brightness=1.05'),
  ('فرابيه كراميل', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&h=600&fit=crop&q=85'),
  ('آيس موكا', 'https://images.unsplash.com/photo-1579440907930-028f1c02e46b?w=800&h=600&fit=crop&q=85'),
  ('ماتشا لاتيه بارد', 'https://images.unsplash.com/photo-1515823064-d6e0f004aeca?w=800&h=600&fit=crop&q=85'),
  ('ليموناضة بالنعناع', 'https://images.unsplash.com/photo-1621263765818-1fd1b17918de?w=800&h=600&fit=crop&q=85'),
  ('عصير برتقال طازج', 'https://images.unsplash.com/photo-1622597467836-f9a748f9c0e0?w=800&h=600&fit=crop&q=85'),
  ('سموذي فراولة', 'https://images.unsplash.com/photo-1553530666-ba11a7da8558?w=800&h=600&fit=crop&q=85'),
  ('موهيتو توت', 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop&q=85'),
  ('عصير مانجو', 'https://images.unsplash.com/photo-1600271886742-f371fbb8b6d8?w=800&h=600&fit=crop&q=85'),
  ('شاي مثلج خوخ', 'https://images.unsplash.com/photo-1558168476-d86c9e8f83dc?w=800&h=600&fit=crop&q=85'),
  ('مياه معدنية', 'https://images.unsplash.com/photo-1548839140-29a43e5be958?w=800&h=600&fit=crop&q=85'),
  ('كروسان زبدة', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop&q=85'),
  ('رول قرفة', 'https://images.unsplash.com/photo-1558961363-fa37fdbc2b12?w=800&h=600&fit=crop&q=85'),
  ('باغل بالجبن', 'https://images.unsplash.com/photo-1551182891-681a7d1f0e0e?w=800&h=600&fit=crop&q=85'),
  ('توست أفوكادو', 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800&h=600&fit=crop&q=85'),
  ('ساندويتش جبن مشوي', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800&h=600&fit=crop&q=85'),
  ('سلطة سيزر', 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop&q=85'),
  ('مافن توت أزرق', 'https://images.unsplash.com/photo-1607958996333-41efef572d0d?w=800&h=600&fit=crop&q=85'),
  ('وافل بلجيكي', 'https://images.unsplash.com/photo-1562376552-0d160a2b2380?w=800&h=600&fit=crop&q=85'),
  ('كوكيز الشوكولاتة', 'https://images.unsplash.com/photo-1499636136210-6f4eee915583?w=800&h=600&fit=crop&q=85'),
  ('براوني شوكولاتة', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop&q=85'),
  ('تشيز كيك بيري', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&h=600&fit=crop&q=85'),
  ('ساندويتش ديك رومي', 'https://images.unsplash.com/photo-1509722747047-dc9e12c9a744?w=800&h=600&fit=crop&q=85'),
  ('تيراميسو', 'https://images.unsplash.com/photo-1571877227200-7d38b9bc0a0e?w=800&h=600&fit=crop&q=85'),
  ('كيك شوكولاتة', 'https://images.unsplash.com/photo-1578985545062-c303585a0f80?w=800&h=600&fit=crop&q=85'),
  ('كرواسون شوكولاتة', 'https://images.unsplash.com/photo-1623334044303-241a4526c81e?w=800&h=600&fit=crop&q=85'),
  ('ماكرون فرنسي', 'https://images.unsplash.com/photo-1569864358642-9d1b1c4e8b0e?w=800&h=600&fit=crop&q=85'),
  ('آيس كريم فانيلا', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop&q=85'),
  ('بافلوفا توت', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop&q=85'),
  ('دونات محشوة', 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&h=600&fit=crop&q=85'),
  ('كريم بروليه', 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800&h=600&fit=crop&q=85'),
  ('تشيز كيك نيويورك', 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=800&h=600&fit=crop&q=85'),
  ('موس شوكولاتة', 'https://images.unsplash.com/photo-1624354476848-1ecb4f4f9a44?w=800&h=600&fit=crop&q=85'),
  ('بيض بنديكت', 'https://images.unsplash.com/photo-1482049016669-50faeba9caff?w=800&h=600&fit=crop&q=85'),
  ('بان كيك كلاسيك', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7440?w=800&h=600&fit=crop&q=85'),
  ('توست فرنسي', 'https://images.unsplash.com/photo-1484727325834-9566d6d0e0e0?w=800&h=600&fit=crop&q=85'),
  ('شكشوكة', 'https://images.unsplash.com/photo-1590412201908-48c9f1c0f1c0?w=800&h=600&fit=crop&q=85'),
  ('أومليت خضار', 'https://images.unsplash.com/photo-1525358824349-400b814ede0e?w=800&h=600&fit=crop&q=85'),
  ('بول granola', 'https://images.unsplash.com/photo-1517686469429-9bbb095e1f1a?w=800&h=600&fit=crop&q=85'),
  ('فطور إنجليزي', 'https://images.unsplash.com/photo-1525358824349-400b814ede0e?w=800&h=600&fit=crop&q=85&sat=15'),
  ('سموذي بول', 'https://images.unsplash.com/photo-1511690740660-5852f4a042ca?w=800&h=600&fit=crop&q=85&sat=10')
) as v(name_ar, image_url)
where lower(trim(i.name_ar)) = lower(trim(v.name_ar));
