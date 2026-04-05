-- Add owner_id to events for per-user calendar isolation
-- Depends on: 20260325_01_initial_schema.sql, 20260403_scheduler_rls.sql

alter table public.events
  add column if not exists owner_id uuid references public.profiles(id) on delete cascade;

-- Backfill: assign all existing seeded events to the demo user
update public.events
  set owner_id = '00000000-0000-0000-0000-000000000001'
  where owner_id is null;

alter table public.events alter column owner_id set not null;
alter table public.events alter column owner_id set default auth.uid();

-- Replace the role-based policies from 20260403_scheduler_rls.sql with owner-scoped ones
drop policy if exists "events_select_all_roles" on public.events;
drop policy if exists "events_insert_write_roles" on public.events;
drop policy if exists "events_update_write_roles" on public.events;
drop policy if exists "events_delete_write_roles" on public.events;

create policy "events_select_owner"
  on public.events for select
  using (owner_id = auth.uid());

create policy "events_insert_owner"
  on public.events for insert
  with check (
    owner_id = auth.uid()
    and public.current_user_role() in ('admin', 'consultant')
  );

create policy "events_update_owner"
  on public.events for update
  using (
    owner_id = auth.uid()
    and public.current_user_role() in ('admin', 'consultant')
  );

create policy "events_delete_owner"
  on public.events for delete
  using (
    owner_id = auth.uid()
    and public.current_user_role() in ('admin', 'consultant')
  );

create index if not exists events_owner_id_idx on public.events (owner_id);
