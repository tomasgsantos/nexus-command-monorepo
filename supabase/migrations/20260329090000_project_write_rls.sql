-- Admin-only write policies for projects
-- Replaces the owner-based INSERT/UPDATE/DELETE policies with admin-only access.
-- SELECT policy is untouched (already exists in 20260326_rls_policies.sql).
-- Depends on: 20260326_rls_policies.sql, public.current_user_role()

-- Drop existing owner-based write policies
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

-- INSERT: admin only
create policy "projects_insert_admin"
  on public.projects for insert
  with check (public.current_user_role() = 'admin');

-- UPDATE: admin only
create policy "projects_update_admin"
  on public.projects for update
  using (public.current_user_role() = 'admin');

-- DELETE: admin only
create policy "projects_delete_admin"
  on public.projects for delete
  using (public.current_user_role() = 'admin');
