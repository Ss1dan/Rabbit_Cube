import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './store/authSlice';
import computerReducer from './store/computerSlice';
import bookingReducer from './store/bookingSlice';
import profileReducer from './store/profileSlice';
import historyReducer from './store/historySlice';
import kitchenReducer from './store/kitchenSlice';
import { MemoryRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  MemoryRouter: ({ children }) => children,
}));

const createTestStore = (preloadedState = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      computers: computerReducer,
      booking: bookingReducer,
      profile: profileReducer,
      history: historyReducer,
      kitchen: kitchenReducer,
    },
    preloadedState,
  });

export const renderWithProviders = (
  ui,
  { preloadedState = {}, store = createTestStore(preloadedState) } = {}
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

export * from '@testing-library/react';
export { createTestStore };