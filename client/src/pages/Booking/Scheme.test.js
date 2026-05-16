import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Scheme from './Scheme';

test('calls onPlaceClick with id', () => {
  const onPlaceClick = jest.fn();
  render(<Scheme onPlaceClick={onPlaceClick} occupiedIds={[]} selectedPlace={null} />);
  const place = screen.getByText('1');
  fireEvent.click(place);
  expect(onPlaceClick).toHaveBeenCalledWith(1);
});