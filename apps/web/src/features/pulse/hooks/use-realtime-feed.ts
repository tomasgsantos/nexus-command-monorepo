import { useState, useEffect, useCallback } from 'react';
import { fetchProjects, subscribeToProjects } from '@nexus/api';
import type { Project, ProjectWithOwner } from '@nexus/api';

export function useRealtimeFeed() {
  const [projects, setProjects] = useState<ProjectWithOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Realtime events are raw DB rows — no profile join. Preserve owner_display_name
  // from existing state, or fall back to 'Unknown' for new inserts.
  const handleRealtimeUpdate = useCallback((updated: Project) => {
    setProjects((prev) => {
      const index = prev.findIndex((p) => p.id === updated.id);
      const owner_display_name = index !== -1 ? prev[index].owner_display_name : 'Unknown';
      const withOwner: ProjectWithOwner = { ...updated, owner_display_name };
      if (index === -1) return [...prev, withOwner];
      const next = [...prev];
      next[index] = withOwner;
      return next;
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load projects');
          setLoading(false);
        }
      });

    const channel = subscribeToProjects(handleRealtimeUpdate);

    return () => {
      cancelled = true;
      channel.unsubscribe();
    };
  }, [handleRealtimeUpdate]);

  const refresh = useCallback(() => {
    fetchProjects()
      .then((data) => setProjects(data))
      .catch(() => { /* realtime will catch up */ });
  }, []);

  return { projects, loading, error, refresh };
}
