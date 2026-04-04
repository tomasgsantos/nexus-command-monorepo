-- Scheduler RLS policies and indexes for the events table
-- Depends on: 20260325_01_initial_schema.sql, 20260326_rls_policies.sql, public.current_user_role()
-- Drops the existing owner-based events policies and replaces them with role-based policies.

-- Enable RLS (idempotent — safe to run even if already enabled)
alter table public.events enable row level security;

-- Drop existing events policies added in 20260326_rls_policies.sql
drop policy if exists "events_select" on public.events;
drop policy if exists "events_insert" on public.events;
drop policy if exists "events_update" on public.events;
drop policy if exists "events_delete" on public.events;

-- SELECT: admin, consultant, viewer, demo (all authenticated roles)
create policy "events_select_all_roles"
  on public.events for select
  using (
    public.current_user_role() in ('admin', 'consultant', 'viewer', 'demo')
  );

-- INSERT: admin and consultant only
create policy "events_insert_write_roles"
  on public.events for insert
  with check (
    public.current_user_role() in ('admin', 'consultant')
  );

-- UPDATE: admin and consultant only
create policy "events_update_write_roles"
  on public.events for update
  using (
    public.current_user_role() in ('admin', 'consultant')
  );

-- DELETE: admin and consultant only
create policy "events_delete_write_roles"
  on public.events for delete
  using (
    public.current_user_role() in ('admin', 'consultant')
  );

-- Indexes for common query patterns
create index if not exists events_project_id_idx on public.events (project_id);
create index if not exists events_start_at_idx on public.events (start_at);
