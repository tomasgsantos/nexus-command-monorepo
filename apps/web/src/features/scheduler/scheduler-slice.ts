import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Event } from '@nexus/api';

interface SchedulerState {
  events: Event[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
}

const initialState: SchedulerState = {
  events: [],
  loading: false,
  error: null,
  hasFetched: false,
};

const schedulerSlice = createSlice({
  name: 'scheduler',
  initialState,
  reducers: {
    setEvents(state, action: PayloadAction<Event[]>) {
      state.events = action.payload;
      state.hasFetched = true;
    },
    addEvent(state, action: PayloadAction<Event>) {
      if (!state.events.some((e) => e.id === action.payload.id)) {
        state.events.push(action.payload);
      }
    },
    updateEvent(state, action: PayloadAction<Event>) {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) state.events[index] = action.payload;
    },
    removeEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter((e) => e.id !== action.payload);
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    resetScheduler() {
      return initialState;
    },
    resetFetch(state) {
      state.hasFetched = false;
    },
  },
});

export const { setEvents, addEvent, updateEvent, removeEvent, setLoading, setError, resetScheduler, resetFetch } =
  schedulerSlice.actions;

export const schedulerReducer = schedulerSlice.reducer;
