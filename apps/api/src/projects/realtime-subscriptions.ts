import { supabase } from '../supabase-client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Project } from './project-queries';

/**
 * Subscribe to INSERT, UPDATE, and DELETE events on the projects table.
 * Calls `callback` with the affected project row on each change.
 * Returns the RealtimeChannel so the caller can unsubscribe via `.unsubscribe()`.
 */
export function subscribeToProjects(
  callback: (project: Project) => void,
): RealtimeChannel {
  return supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'projects' },
      (payload) => {
        const project = (payload.new ?? payload.old) as Project;
        callback(project);
      },
    )
    .subscribe();
}
