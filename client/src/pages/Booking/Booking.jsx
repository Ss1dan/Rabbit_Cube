import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOccupiedForSlot } from '../../store/computerSlice';
import { setDate, setTimeStart, setTimeEnd, selectPlace, clearBooking, createBooking, toggleKitchenItem } from '../../store/bookingSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import Scheme from './Scheme';
import Popup from './Popup';
import styles from './Booking.module.css';

const Booking = () => {
  const dispatch = useDispatch();
  const { selectedDate, selectedTimeStart, selectedTimeEnd, selectedPlace, kitchenItems, success, loading } = useSelector(state => state.booking);
  const { occupiedIds } = useSelector(state => state.computers);
  const [showPopup, setShowPopup] = useState(false);
  const selectedDateObj = new Date(selectedDate);

  // Обновление занятых мест при изменении даты/времени
  useEffect(() => {
    document.title = 'Rabbit Cube — Бронирование';
    if (selectedTimeStart && selectedTimeEnd) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      dispatch(fetchOccupiedForSlot({ date: dateStr, start_time: selectedTimeStart, end_time: selectedTimeEnd }));
    }
  }, [selectedDate, selectedTimeStart, selectedTimeEnd, dispatch]);

  const handleDateChange = (date) => {
    dispatch(setDate(date));
  };

  const handlePlaceClick = (id) => {
    dispatch(selectPlace(id));
    setShowPopup(true);
  };

  const handleBooking = () => {
    const startTimeWithSeconds = selectedTimeStart.length === 5 ? selectedTimeStart + ':00' : selectedTimeStart;
    const endTimeWithSeconds = selectedTimeEnd.length === 5 ? selectedTimeEnd + ':00' : selectedTimeEnd;
    if (!selectedPlace || !selectedTimeStart || !selectedTimeEnd) {
      alert('Выберите дату, время и место');
      return;
    }
    dispatch(createBooking({
      computer_id: selectedPlace,
      booking_date: dayjs(selectedDate).format('YYYY-MM-DD'),
      start_time: selectedTimeStart,
      end_time: selectedTimeEnd,
      kitchen_items: kitchenItems
    })).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        alert('Бронирование успешно!');
        dispatch(clearBooking());
      }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Выберите дату и время</h1>

      <div className={styles.datePicker}>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          minDate={new Date()}
          inline
          className={styles.customDatePicker}
        />
      </div>

      <div className={styles.timeBlock}>
        <input 
          type="time" 
          value={selectedTimeStart} 
          onChange={(e) => dispatch(setTimeStart(e.target.value))}
          className={styles.timeInput}
        />
        <span className={styles.timeSeparator}>—</span>
        <input 
          type="time" 
          value={selectedTimeEnd} 
          onChange={(e) => dispatch(setTimeEnd(e.target.value))}
          className={styles.timeInput}
        />
      </div>

      <Scheme onPlaceClick={handlePlaceClick} occupiedIds={occupiedIds} selectedPlace={selectedPlace} />

      {showPopup && selectedPlace && (
        <Popup 
          onClose={() => setShowPopup(false)} 
          onBook={handleBooking}
          kitchenItemsSelected={kitchenItems}
          onToggleKitchen={id => dispatch(toggleKitchenItem(id))}
        />
      )}
    </div>
  );
};

export default Booking;