CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Demo seed data — safe to run in local / staging environments
-- Uses a fixed UUID so re-running is idempotent

do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  proj_alpha    uuid := gen_random_uuid();
  proj_beta     uuid := gen_random_uuid();
  proj_gamma    uuid := gen_random_uuid();
begin

-- -------------------------------------------------------
-- Demo auth user (Supabase auth.users insert pattern)
-- -------------------------------------------------------
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
values (
  demo_user_id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'demo@nexus.app',
  -- bcrypt hash of 'nexus-demo-2025'
  extensions.crypt('nexus-demo-2025', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Demo profile
-- -------------------------------------------------------
insert into public.profiles (id, role, display_name, avatar_url)
values (demo_user_id, 'demo', 'Demo User', null)
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Sample projects
-- -------------------------------------------------------
insert into public.projects (id, title, health_status, lat, lng, owner_id)
values
  (proj_alpha, 'Alpha Rebrand', 'on_track',   40.7128, -74.0060, demo_user_id),
  (proj_beta,  'Beta Platform', 'at_risk',    51.5074,  -0.1278, demo_user_id),
  (proj_gamma, 'Gamma Launch',  'failing',    35.6762, 139.6503, demo_user_id)
on conflict (id) do nothing;

-- -------------------------------------------------------
-- Sample events (5)
-- -------------------------------------------------------
insert into public.events (title, start_at, end_at, project_id, caldav_uid)
values
  ('Kickoff Call',
    now() + interval '1 day',
    now() + interval '1 day' + interval '1 hour',
    proj_alpha, 'caldav-001'),
  ('Design Review',
    now() + interval '3 days',
    now() + interval '3 days' + interval '2 hours',
    proj_alpha, 'caldav-002'),
  ('Sprint Planning',
    now() + interval '5 days',
    now() + interval '5 days' + interval '1 hour',
    proj_beta, 'caldav-003'),
  ('Stakeholder Demo',
    now() + interval '7 days',
    now() + interval '7 days' + interval '90 minutes',
    proj_beta, 'caldav-004'),
  ('Launch Retrospective',
    now() + interval '14 days',
    now() + interval '14 days' + interval '1 hour',
    proj_gamma, 'caldav-005');

-- -------------------------------------------------------
-- Sample playbooks (2)
-- -------------------------------------------------------
insert into public.playbooks (title, owner_id, steps)
values
  ('Onboarding Playbook', demo_user_id,
    '[{"step":1,"title":"Send welcome email"},{"step":2,"title":"Schedule intro call"},{"step":3,"title":"Assign starter tasks"}]'::jsonb),
  ('Incident Response', demo_user_id,
    '[{"step":1,"title":"Acknowledge alert"},{"step":2,"title":"Identify scope"},{"step":3,"title":"Notify stakeholders"},{"step":4,"title":"Resolve & document"}]'::jsonb);

-- -------------------------------------------------------
-- Sample services (3)
-- -------------------------------------------------------
insert into public.services (title, description, price_tiers)
values
  ('Strategy Consulting',
    'End-to-end strategic advisory for growth-stage companies.',
    '[{"name":"Starter","price":2500},{"name":"Growth","price":7500},{"name":"Enterprise","price":20000}]'::jsonb),
  ('Brand Identity',
    'Full visual identity design including logo, palette, and guidelines.',
    '[{"name":"Essentials","price":1500},{"name":"Complete","price":4500}]'::jsonb),
  ('Tech Due Diligence',
    'Comprehensive technical audit and risk assessment report.',
    '[{"name":"Standard","price":3500},{"name":"Deep Dive","price":9000}]'::jsonb);

end $$;
