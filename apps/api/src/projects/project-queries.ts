import { supabase } from '../supabase-client';
import type { Database } from '../types/Database';

export type Project = Database['public']['Tables']['projects']['Row'];

export interface ProjectWithOwner extends Project {
  owner_display_name: string;
}

const PROJECT_WITH_OWNER_SELECT = '*, profiles!owner_id(display_name)';

/**
 * Fetch all projects with owner display name, ordered by title.
 */
export async function fetchProjects(): Promise<ProjectWithOwner[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_WITH_OWNER_SELECT)
    .order('title');

  if (error) {
    throw new Error(`fetchProjects failed: ${error.message}`);
  }

  return (data as any[]).map(flattenOwner);
}

/**
 * Fetch a single project by ID with owner display name, or null if not found.
 */
export async function fetchProject(id: string): Promise<ProjectWithOwner | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_WITH_OWNER_SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`fetchProject failed: ${error.message}`);
  }

  if (!data) return null;

  return flattenOwner(data as any);
}

function flattenOwner(row: any): ProjectWithOwner {
  const { profiles, ...project } = row;
  return {
    ...project,
    owner_display_name: profiles?.display_name ?? 'Unknown',
  };
}
