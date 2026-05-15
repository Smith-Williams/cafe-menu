-- Optional sample data (run after schema.sql)

-- Run once. Adds demo categories; add items from لوحة المالك after.

insert into public.categories (name_ar, sort_order)
values
  ('قهوة ساخنة', 1),
  ('مخبوزات', 2),
  ('مشروبات باردة', 3);
