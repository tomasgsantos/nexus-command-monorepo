/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import type { Event } from '@nexus/api';
import {
  schedulerReducer,
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  setLoading,
  setError,
  resetScheduler,
  resetFetch,
} from '../scheduler-slice';

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

const initialState = {
  events: [],
  loading: false,
  error: null,
  hasFetched: false,
};

describe('schedulerReducer', () => {
  describe('setEvents', () => {
    it('replaces events and sets hasFetched to true', () => {
      const events = [makeEvent(), makeEvent({ id: 'evt-2', title: 'Sprint Review' })];
      const state = schedulerReducer(initialState, setEvents(events));

      expect(state.events).toEqual(events);
      expect(state.hasFetched).toBe(true);
    });
  });

  describe('addEvent', () => {
    it('appends a new event', () => {
      const event = makeEvent();
      const state = schedulerReducer(initialState, addEvent(event));

      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual(event);
    });

    it('does not add a duplicate event with the same id', () => {
      const event = makeEvent();
      const withOne = schedulerReducer(initialState, addEvent(event));
      const withDuplicate = schedulerReducer(withOne, addEvent(event));

      expect(withDuplicate.events).toHaveLength(1);
    });
  });

  describe('updateEvent', () => {
    it('replaces the matching event by id', () => {
      const original = makeEvent();
      const updated = makeEvent({ title: 'Updated Standup' });
      const withEvent = schedulerReducer(initialState, addEvent(original));
      const state = schedulerReducer(withEvent, updateEvent(updated));

      expect(state.events[0].title).toBe('Updated Standup');
    });

    it('does nothing when id does not exist', () => {
      const event = makeEvent();
      const withEvent = schedulerReducer(initialState, addEvent(event));
      const state = schedulerReducer(withEvent, updateEvent(makeEvent({ id: 'unknown' })));

      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual(event);
    });
  });

  describe('removeEvent', () => {
    it('removes the event with the given id', () => {
      const event = makeEvent();
      const withEvent = schedulerReducer(initialState, addEvent(event));
      const state = schedulerReducer(withEvent, removeEvent('evt-1'));

      expect(state.events).toHaveLength(0);
    });

    it('leaves other events intact', () => {
      const a = makeEvent({ id: 'a' });
      const b = makeEvent({ id: 'b' });
      let state = schedulerReducer(initialState, addEvent(a));
      state = schedulerReducer(state, addEvent(b));
      state = schedulerReducer(state, removeEvent('a'));

      expect(state.events).toHaveLength(1);
      expect(state.events[0].id).toBe('b');
    });
  });

  describe('setLoading', () => {
    it('sets loading to true', () => {
      const state = schedulerReducer(initialState, setLoading(true));
      expect(state.loading).toBe(true);
    });

    it('sets loading to false', () => {
      const state = schedulerReducer({ ...initialState, loading: true }, setLoading(false));
      expect(state.loading).toBe(false);
    });
  });

  describe('setError', () => {
    it('stores an error message', () => {
      const state = schedulerReducer(initialState, setError('Something went wrong'));
      expect(state.error).toBe('Something went wrong');
    });

    it('clears the error when null is passed', () => {
      const state = schedulerReducer({ ...initialState, error: 'old error' }, setError(null));
      expect(state.error).toBeNull();
    });
  });

  describe('resetScheduler', () => {
    it('resets the state back to initial values', () => {
      const dirty = {
        events: [makeEvent()],
        loading: true,
        error: 'err',
        hasFetched: true,
      };
      const state = schedulerReducer(dirty, resetScheduler());
      expect(state).toEqual(initialState);
    });
  });

  describe('resetFetch', () => {
    it('sets hasFetched to false without clearing events', () => {
      const event = makeEvent();
      let state = schedulerReducer(initialState, setEvents([event]));
      state = schedulerReducer(state, resetFetch());

      expect(state.hasFetched).toBe(false);
      expect(state.events).toHaveLength(1);
    });
  });
});
