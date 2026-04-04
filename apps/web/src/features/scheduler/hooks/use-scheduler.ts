import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, createEvent as apiCreateEvent, updateEvent as apiUpdateEvent, deleteEvent as apiDeleteEvent } from '@nexus/api';
import type { CreateEventInput, UpdateEventInput } from '@nexus/api';
import { setEvents, addEvent, updateEvent, removeEvent, setLoading, setError } from '../scheduler-slice';
import type { RootState } from '../../../store';

export function useScheduler() {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state: RootState) => state.scheduler);

  useEffect(() => {
    dispatch(setLoading(true));
    fetchEvents()
      .then((data) => {
        dispatch(setEvents(data));
        dispatch(setLoading(false));
      })
      .catch((err) => {
        dispatch(setError(err instanceof Error ? err.message : 'Failed to load events'));
        dispatch(setLoading(false));
      });
  }, [dispatch]);

  const createEvent = useCallback(
    async (data: CreateEventInput) => {
      const event = await apiCreateEvent(data);
      dispatch(addEvent(event));
      return event;
    },
    [dispatch],
  );

  const updateEventFn = useCallback(
    async (id: string, data: Omit<UpdateEventInput, 'id'>) => {
      const event = await apiUpdateEvent(id, { ...data, id });
      dispatch(updateEvent(event));
      return event;
    },
    [dispatch],
  );

  const deleteEventFn = useCallback(
    async (id: string) => {
      await apiDeleteEvent(id);
      dispatch(removeEvent(id));
    },
    [dispatch],
  );

  return { events, loading, error, createEvent, updateEvent: updateEventFn, deleteEvent: deleteEventFn };
}
