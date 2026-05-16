import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../../store/authSlice';
import BurgerMenu from './BurgerMenu';

const createStore = () =>
  configureStore({
    reducer: { auth: authReducer },
  });

test('renders menu items when open', () => {
  render(
    <Provider store={createStore()}>
      <BurgerMenu isOpen={true} onClose={() => {}} />
    </Provider>
  );
  expect(screen.getByText('Личный кабинет')).toBeInTheDocument();
  expect(screen.getByText('Бронирование')).toBeInTheDocument();
  expect(screen.getByText('Прайс Лист')).toBeInTheDocument();
});

test('does not render menu when closed', () => {
  render(
    <Provider store={createStore()}>
      <BurgerMenu isOpen={false} onClose={() => {}} />
    </Provider>
  );
  expect(screen.queryByText('Личный кабинет')).not.toBeInTheDocument();
});

test('calls onClose when overlay clicked', () => {
  const handleClose = jest.fn();
  render(
    <Provider store={createStore()}>
      <BurgerMenu isOpen={true} onClose={handleClose} />
    </Provider>
  );
  const overlay = screen.getByLabelText('Закрыть меню');
  fireEvent.click(overlay);
  expect(handleClose).toHaveBeenCalled();
});