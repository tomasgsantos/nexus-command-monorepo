import { useState, useEffect, useCallback } from 'react';
import { fetchProjects, subscribeToProjects } from '@nexus/api';
import type { Project } from '@nexus/api';

export function useRealtimeFeed() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRealtimeUpdate = useCallback((updated: Project) => {
    setProjects((prev) => {
      const index = prev.findIndex((p) => p.id === updated.id);
      if (index === -1) return [...prev, updated];
      const next = [...prev];
      next[index] = updated;
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

  return { projects, loading, error };
}
