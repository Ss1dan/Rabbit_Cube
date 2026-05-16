import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import computerReducer from './computerSlice';
import bookingReducer from './bookingSlice';
import profileReducer from './profileSlice';
import historyReducer from './historySlice';
import kitchenReducer from './kitchenSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    computers: computerReducer,
    booking: bookingReducer,
    profile: profileReducer,
    kitchen: kitchenReducer,
    history: historyReducer
  }
});