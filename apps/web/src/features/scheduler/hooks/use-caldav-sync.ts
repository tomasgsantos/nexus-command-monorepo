import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { createCalDavClient, syncCalDavEvents, createEvent as apiCreateEvent } from '@nexus/api';
import { addEvent } from '../scheduler-slice';

interface SyncCredentials {
  serverUrl: string;
  username: string;
  password: string;
  calendarUrl: string;
}

export function useCalDavSync() {
  const dispatch = useDispatch();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncNow = useCallback(
    async ({ serverUrl, username, password, calendarUrl }: SyncCredentials) => {
      setSyncing(true);
      setError(null);
      try {
        const client = createCalDavClient(serverUrl, { username, password });
        const caldavEvents = await syncCalDavEvents(client, calendarUrl);
        for (const e of caldavEvents) {
          const created = await apiCreateEvent({
            title: e.title,
            start_at: e.start,
            end_at: e.end,
            project_id: null,
            caldav_uid: e.uid,
          });
          dispatch(addEvent(created));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CalDAV sync failed');
      } finally {
        setSyncing(false);
      }
    },
    [dispatch],
  );

  return { syncing, error, syncNow };
}
