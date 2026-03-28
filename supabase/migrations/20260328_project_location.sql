-- Add city and country columns to projects table
alter table public.projects
  add column if not exists city    text,
  add column if not exists country text;

-- Backfill city/country for demo projects seeded before these columns existed
update public.projects set city = 'New York',  country = 'United States'  where title = 'Alpha Rebrand';
update public.projects set city = 'London',    country = 'United Kingdom' where title = 'Beta Platform';
update public.projects set city = 'Tokyo',     country = 'Japan'          where title = 'Gamma Launch';
