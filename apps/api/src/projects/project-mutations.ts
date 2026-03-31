import { supabase } from '../supabase-client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '../types/Project';

// The Database type uses a simplified schema that doesn't include
// Relationships metadata, so Supabase's generic resolution on write
// operations falls back to `never`. We use an untyped reference for
// mutations while keeping the public API fully typed.
function projectsTable() {
  return (supabase as any).from('projects');
}

export async function createProject(data: CreateProjectInput): Promise<Project> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('createProject failed: not authenticated');
  }

  const { data: project, error } = await projectsTable()
    .insert({ ...data, owner_id: user.id })
    .select()
    .single();

  if (error) {
    throw new Error(`createProject failed: ${error.message}`);
  }

  return project as Project;
}

export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  const { data: project, error } = await projectsTable()
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`updateProject failed: ${error.message}`);
  }

  return project as Project;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await projectsTable()
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`deleteProject failed: ${error.message}`);
  }
}
