import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import stationsReducer from './slices/stationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    stations: stationsReducer,
  },
});
