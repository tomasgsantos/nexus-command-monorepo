-- Add city and country columns to projects table
alter table public.projects
  add column if not exists city    text,
  add column if not exists country text;
