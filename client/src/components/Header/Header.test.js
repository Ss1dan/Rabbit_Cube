import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from './Header';

test('renders logo and burger button', () => {
  render(<Header onBurgerClick={() => {}} />);
  expect(screen.getByText('Rabbit Cube')).toBeInTheDocument();
  expect(screen.getByLabelText('Открыть меню')).toBeInTheDocument();
});

test('burger button calls onBurgerClick', () => {
  const handleClick = jest.fn();
  render(<Header onBurgerClick={handleClick} />);
  fireEvent.click(screen.getByLabelText('Открыть меню'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});