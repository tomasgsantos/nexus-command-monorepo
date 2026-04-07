/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import {
  setupNexusApiMock,
  mockFetchEvents,
  mockSubscribeToEvents,
  mockCreateEvent,
  mockUpdateEvent,
  mockDeleteEvent,
} from '../__mocks__/nexus-api';

setupNexusApiMock();

import type { Event } from '@nexus/api';
import { useScheduler } from '../hooks/use-scheduler';
import { schedulerReducer, setError, setEvents } from '../scheduler-slice';

function makeEvent(overrides?: Partial<Event>): Event {
  return {
    id: 'evt-1',
    title: 'Team Standup',
    start_at: '2026-04-06T09:00:00Z',
    end_at: '2026-04-06T09:30:00Z',
    project_id: null,
    caldav_uid: null,
    owner_id: 'user-1',
    expires_at: null,
    ...overrides,
  };
}

function makeStore() {
  return configureStore({ reducer: { scheduler: schedulerReducer } });
}

function makeWrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Provider, { store, children });
  };
}

const mockUnsubscribe = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  mockSubscribeToEvents.mockReturnValue({ unsubscribe: mockUnsubscribe });
});

describe('useScheduler', () => {
  it('fetches events on first render and sets them in state', async () => {
    const events = [makeEvent(), makeEvent({ id: 'evt-2', title: 'Sprint Review' })];
    mockFetchEvents.mockResolvedValue(events);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    expect(mockFetchEvents).toHaveBeenCalledOnce();
    expect(result.current.events).toEqual(events);
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch again when hasFetched is true', async () => {
    mockFetchEvents.mockResolvedValue([]);

    const store = makeStore();
    const wrapper = makeWrapper(store);

    const { rerender } = renderHook(() => useScheduler(), { wrapper });
    await act(async () => {});

    rerender();
    await act(async () => {});

    expect(mockFetchEvents).toHaveBeenCalledOnce();
  });

  it('exposes error from the store', () => {
    const store = makeStore();
    store.dispatch(setError('network failure'));
    store.dispatch(setEvents([]));

    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    expect(result.current.error).toBe('network failure');
  });

  it('subscribes to realtime on mount and unsubscribes on unmount', async () => {
    mockFetchEvents.mockResolvedValue([]);

    const store = makeStore();
    const { unmount } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    expect(mockSubscribeToEvents).toHaveBeenCalledOnce();

    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledOnce();
  });

  it('realtime onInsert adds event to state', async () => {
    mockFetchEvents.mockResolvedValue([]);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    const { onInsert } = mockSubscribeToEvents.mock.calls[0][0];
    const newEvent = makeEvent({ id: 'evt-new' });

    act(() => { onInsert(newEvent); });

    expect(result.current.events).toContainEqual(newEvent);
  });

  it('realtime onUpdate replaces the event in state', async () => {
    const event = makeEvent();
    mockFetchEvents.mockResolvedValue([event]);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    const { onUpdate } = mockSubscribeToEvents.mock.calls[0][0];
    const updated = makeEvent({ title: 'Updated Standup' });

    act(() => { onUpdate(updated); });

    expect(result.current.events[0].title).toBe('Updated Standup');
  });

  it('realtime onDelete removes the event from state', async () => {
    const event = makeEvent();
    mockFetchEvents.mockResolvedValue([event]);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    const { onDelete } = mockSubscribeToEvents.mock.calls[0][0];

    act(() => { onDelete('evt-1'); });

    expect(result.current.events).toHaveLength(0);
  });

  it('createEvent calls the API and adds the returned event', async () => {
    mockFetchEvents.mockResolvedValue([]);
    const created = makeEvent({ id: 'evt-created' });
    mockCreateEvent.mockResolvedValue(created);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    await act(async () => {
      await result.current.createEvent({ title: 'Team Standup', start_at: '2026-04-06T09:00:00Z', end_at: '2026-04-06T09:30:00Z', project_id: null, caldav_uid: null });
    });

    expect(mockCreateEvent).toHaveBeenCalledOnce();
    expect(result.current.events).toContainEqual(created);
  });

  it('updateEvent calls the API and updates state', async () => {
    const event = makeEvent();
    mockFetchEvents.mockResolvedValue([event]);
    const updated = makeEvent({ title: 'New Title' });
    mockUpdateEvent.mockResolvedValue(updated);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    await act(async () => {
      await result.current.updateEvent('evt-1', { title: 'New Title', start_at: event.start_at, end_at: event.end_at, project_id: null, caldav_uid: null });
    });

    expect(mockUpdateEvent).toHaveBeenCalledOnce();
    expect(result.current.events[0].title).toBe('New Title');
  });

  it('deleteEvent calls the API and removes the event from state', async () => {
    const event = makeEvent();
    mockFetchEvents.mockResolvedValue([event]);
    mockDeleteEvent.mockResolvedValue(undefined);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});

    await act(async () => {
      await result.current.deleteEvent('evt-1');
    });

    expect(mockDeleteEvent).toHaveBeenCalledWith('evt-1');
    expect(result.current.events).toHaveLength(0);
  });

  it('refetch resets hasFetched so the next render triggers a new fetch', async () => {
    mockFetchEvents.mockResolvedValue([]);

    const store = makeStore();
    const { result } = renderHook(() => useScheduler(), { wrapper: makeWrapper(store) });

    await act(async () => {});
    expect(mockFetchEvents).toHaveBeenCalledOnce();

    act(() => { result.current.refetch(); });

    await act(async () => {});
    expect(mockFetchEvents).toHaveBeenCalledTimes(2);
  });

  it('notify callback is called when realtime onInsert fires', async () => {
    mockFetchEvents.mockResolvedValue([]);
    const notify = vi.fn();

    const store = makeStore();
    renderHook(() => useScheduler(notify), { wrapper: makeWrapper(store) });

    await act(async () => {});

    const { onInsert } = mockSubscribeToEvents.mock.calls[0][0];

    act(() => { onInsert(makeEvent()); });

    expect(notify).toHaveBeenCalledWith('Event created');
  });
});
