import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
  subscribeToEvents,
} from '@nexus/api';
import type { CreateEventInput, UpdateEventInput } from '@nexus/api';
import type { ToastType } from '@nexus/ui';
import { setEvents, addEvent, updateEvent, removeEvent, setLoading, setError, resetFetch } from '../scheduler-slice';
import type { RootState } from '../../../store';

type NotifyFn = (message: string, type?: ToastType) => void;

export function useScheduler(notify?: NotifyFn) {
  const dispatch = useDispatch();
  const { events, loading, error, hasFetched } = useSelector((state: RootState) => state.scheduler);

  const notifyRef = useRef(notify);
  useEffect(() => { notifyRef.current = notify; }, [notify]);

  useEffect(() => {
    if (hasFetched || loading) return;
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
  }, [dispatch, hasFetched, loading]);

  useEffect(() => {
    const channel = subscribeToEvents({
      onInsert: (event) => {
        dispatch(addEvent(event));
        notifyRef.current?.('Event created');
      },
      onUpdate: (event) => {
        dispatch(updateEvent(event));
        notifyRef.current?.('Event updated');
      },
      onDelete: (id) => {
        dispatch(removeEvent(id));
        notifyRef.current?.('Event deleted');
      },
    });
    return () => { channel.unsubscribe(); };
  }, [dispatch]);

  // Reset hasFetched so the fetch effect re-runs on next render.
  const refetch = useCallback(() => {
    dispatch(resetFetch());
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

  return { events, loading, error, refetch, createEvent, updateEvent: updateEventFn, deleteEvent: deleteEventFn };
}
