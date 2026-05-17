import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOccupiedForSlot } from '../../store/computerSlice';
import { setDate, setTimeStart, setTimeEnd, selectPlace, clearBooking, createBooking, toggleKitchenItem } from '../../store/bookingSlice';
import dayjs from 'dayjs';
import Scheme from './Scheme';
import Popup from './Popup';
import styles from './Booking.module.css';
import { useNavigate } from 'react-router-dom';
import { fetchActiveBooking } from '../../store/bookingSlice';
import DatePicker from '../../components/DatePicker/DatePicker';
import TimeWheel from '../../components/TimeWheel/TimeWheel';

const Booking = () => {
  const dispatch = useDispatch();
  const { selectedDate, selectedTimeStart, selectedTimeEnd, selectedPlace, kitchenItems, success, loading } = useSelector(state => state.booking);
  const { occupiedIds } = useSelector(state => state.computers);
  const [showPopup, setShowPopup] = useState(false);
  const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();

  useEffect(() => {
    document.title = 'Rabbit Cube — Бронирование';
    if (selectedTimeStart && selectedTimeEnd) {
      const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
      dispatch(fetchOccupiedForSlot({ date: dateStr, start_time: selectedTimeStart, end_time: selectedTimeEnd }));
    }
  }, [selectedDate, selectedTimeStart, selectedTimeEnd, dispatch]);

  const handleDateChange = (date) => {
    dispatch(setDate(date.toISOString()));
  };

  const handlePlaceClick = (id) => {
    dispatch(selectPlace(id));
    setShowPopup(true);
  };

  const navigate = useNavigate();
  const handleBooking = async () => {
    if (!selectedPlace || !selectedTimeStart || !selectedTimeEnd) {
      alert('Выберите дату, время и место');
      return;
    }
  
    const startTimeWithSec = selectedTimeStart.length === 5 ? selectedTimeStart + ':00' : selectedTimeStart;
    const endTimeWithSec = selectedTimeEnd.length === 5 ? selectedTimeEnd + ':00' : selectedTimeEnd;
  
    const result = await dispatch(createBooking({
      computer_id: selectedPlace,
      booking_date: dayjs(selectedDate).format('YYYY-MM-DD'),
      start_time: startTimeWithSec,
      end_time: endTimeWithSec,
      kitchen_items: kitchenItems,
    }));
  
    if (createBooking.fulfilled.match(result)) {
      dispatch(clearBooking());
      await dispatch(fetchActiveBooking());
      navigate('/profile');
    } else {
      alert(result.payload?.message || 'Ошибка бронирования');
    }
  };


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Выберите дату и время</h1>

      <div className={styles.datePicker}>
      <DatePicker
  selectedDate={selectedDate}
  onDateChange={(date) => dispatch(setDate(date))}
/>
      </div>

      <div className={styles.timeBlock}>
  <TimeWheel
    label="Начало"
    value={selectedTimeStart}
    onChange={(time) => dispatch(setTimeStart(time))}
  />
  <TimeWheel
    label="Конец"
    value={selectedTimeEnd}
    onChange={(time) => dispatch(setTimeEnd(time))}
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