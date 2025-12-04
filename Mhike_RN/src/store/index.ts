import { configureStore } from '@reduxjs/toolkit';
import hikeReducer from './slices/hikeSlice';
import observationReducer from './slices/observationSlice';

export const store = configureStore({
  reducer: {
    hikes: hikeReducer,
    observations: observationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
