-- 1. Add columns (idempotent)
alter table public.projects
  add column if not exists city    text,
  add column if not exists country text;

-- 2. Delete duplicate projects (keep one row per title, the most recently inserted)
delete from public.projects
where id not in (
  select distinct on (title) id
  from public.projects
  order by title, id desc
);

-- 3. Backfill city/country
update public.projects set city = 'New York',  country = 'United States'  where title = 'Alpha Rebrand';
update public.projects set city = 'London',    country = 'United Kingdom' where title = 'Beta Platform';
update public.projects set city = 'Tokyo',     country = 'Japan'          where title = 'Gamma Launch';

-- 4. Fix migration tracking
delete from supabase_migrations.schema_migrations where version = '20260327';
insert into supabase_migrations.schema_migrations (version, name, statements)
values ('20260327', '20260327_demo_seed', array[]::text[]);
insert into supabase_migrations.schema_migrations (version, name, statements)
values ('20260328', '20260328_project_location', array[]::text[])
on conflict (version) do update set name = excluded.name;
