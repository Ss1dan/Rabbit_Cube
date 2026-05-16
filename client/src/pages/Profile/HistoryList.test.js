import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import historyReducer from '../../store/historySlice';
import HistoryList from './HistoryList';

const preloadedHistory = {
  bookings: [
    {
      id: 1,
      computer_name: 'PC-Standard 1',
      computer_type: 'Standard',
      booking_date: '2026-05-21',
      start_time: '10:00:00',
      end_time: '12:00:00',
      status: 'active',
    },
  ],
  currentPage: 1,
  totalPages: 1,
  loading: false,
  error: null,
};

test('displays booking card', () => {
  const store = configureStore({
    reducer: { history: historyReducer },
    preloadedState: { history: preloadedHistory },
  });
  render(
    <Provider store={store}>
      <HistoryList />
    </Provider>
  );
  expect(screen.getByText('PC-Standard 1')).toBeInTheDocument();
});