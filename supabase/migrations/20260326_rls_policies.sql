-- RLS policies for all tables
-- Depends on: 20260325_initial_schema.sql

-- profiles: users can read/update their own row; demo role reads all
create policy "profiles_select_own"
  on public.profiles for select
  using (id = auth.uid() or public.current_user_role() = 'demo');

create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- projects: owner full access; demo read-only
create policy "projects_select"
  on public.projects for select
  using (owner_id = auth.uid() or public.current_user_role() = 'demo');

create policy "projects_insert_own"
  on public.projects for insert
  with check (owner_id = auth.uid());

create policy "projects_update_own"
  on public.projects for update
  using (owner_id = auth.uid());

create policy "projects_delete_own"
  on public.projects for delete
  using (owner_id = auth.uid());

-- events: linked to accessible projects; demo read-only
create policy "events_select"
  on public.events for select
  using (
    public.current_user_role() = 'demo'
    or project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "events_insert"
  on public.events for insert
  with check (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "events_update"
  on public.events for update
  using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

create policy "events_delete"
  on public.events for delete
  using (
    project_id in (select id from public.projects where owner_id = auth.uid())
  );

-- playbooks: owner access; demo read-only
create policy "playbooks_select"
  on public.playbooks for select
  using (owner_id = auth.uid() or public.current_user_role() = 'demo');

create policy "playbooks_insert"
  on public.playbooks for insert
  with check (owner_id = auth.uid());

create policy "playbooks_update"
  on public.playbooks for update
  using (owner_id = auth.uid());

create policy "playbooks_delete"
  on public.playbooks for delete
  using (owner_id = auth.uid());

-- services: any authenticated user can read
create policy "services_select"
  on public.services for select
  using (auth.uid() is not null);

-- orders: users see their own; demo read-only
create policy "orders_select"
  on public.orders for select
  using (user_id = auth.uid() or public.current_user_role() = 'demo');

create policy "orders_insert"
  on public.orders for insert
  with check (user_id = auth.uid());

create policy "orders_update"
  on public.orders for update
  using (user_id = auth.uid());

-- identity_templates: any authenticated user can read
create policy "identity_templates_select"
  on public.identity_templates for select
  using (auth.uid() is not null);
