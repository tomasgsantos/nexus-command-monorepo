import { supabase } from '../supabase-client';
import type { Database } from '../types/Database';

export type Project = Database['public']['Tables']['projects']['Row'];

/**
 * Fetch all projects ordered by title.
 */
export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('title');

  if (error) {
    throw new Error(`fetchProjects failed: ${error.message}`);
  }

  return data;
}

/**
 * Fetch a single project by ID, or null if not found.
 */
export async function fetchProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(`fetchProject failed: ${error.message}`);
  }

  return data;
}
