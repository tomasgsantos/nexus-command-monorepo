import { configureStore } from '@reduxjs/toolkit';
import { schedulerReducer } from './features/scheduler/scheduler-slice';

export const store = configureStore({
  reducer: {
    scheduler: schedulerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
