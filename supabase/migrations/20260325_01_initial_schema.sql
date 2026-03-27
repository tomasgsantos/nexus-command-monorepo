-- profiles
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'viewer'
                 check (role in ('admin', 'consultant', 'viewer', 'demo')),
  display_name text not null,
  avatar_url   text
);

-- projects
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  health_status text not null default 'on_track'
                  check (health_status in ('on_track', 'at_risk', 'failing')),
  lat           double precision,
  lng           double precision,
  owner_id      uuid not null references public.profiles(id) on delete cascade
);

-- events
create table public.events (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  start_at   timestamptz not null,
  end_at     timestamptz not null,
  project_id uuid references public.projects(id) on delete set null,
  caldav_uid text
);

-- playbooks
create table public.playbooks (
  id       uuid primary key default gen_random_uuid(),
  title    text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  steps    jsonb not null default '[]'
);

-- services
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  price_tiers jsonb not null default '[]'
);

-- orders
create table public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  status     text not null default 'pending',
  total      numeric(10, 2) not null
);

-- identity_templates
create table public.identity_templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  canvas_config jsonb not null default '{}'
);

-- Enable RLS on all tables
alter table public.profiles           enable row level security;
alter table public.projects           enable row level security;
alter table public.events             enable row level security;
alter table public.playbooks          enable row level security;
alter table public.services           enable row level security;
alter table public.orders             enable row level security;
alter table public.identity_templates enable row level security;

-- Helper: returns the role of the calling user
create or replace function public.current_user_role()
returns text language sql stable security definer as $$
  select role from public.profiles where id = auth.uid();
$$;
