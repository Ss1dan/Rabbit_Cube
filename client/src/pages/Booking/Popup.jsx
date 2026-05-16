import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../../api';
import styles from './Popup.module.css';
import { fetchKitchenItems } from '../../store/kitchenSlice';

const Popup = ({ onClose, onBook, kitchenItemsSelected, onToggleKitchen }) => {
  const selectedPlaceId = useSelector(state => state.booking.selectedPlace);
  const [computer, setComputer] = useState(null);
  const dispatch = useDispatch();
  const kitchenItems = useSelector(state => state.kitchen.items);

  useEffect(() => {
    if (selectedPlaceId) {
      API.get(`/computers/${selectedPlaceId}`).then(res => setComputer(res.data));
    }
    if (kitchenItems.length === 0) {
      dispatch(fetchKitchenItems());
    }
  }, [selectedPlaceId, dispatch, kitchenItems.length]);

  if (!computer) return null;
  const specs = typeof computer.specs === 'string' ? JSON.parse(computer.specs) : computer.specs;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <h2 className={styles.title}>Информация о месте</h2>
        <div className={styles.info}>
          <p><span className={styles.label}>Название:</span> {computer.name}</p>
          <p><span className={styles.label}>Видеокарта:</span> {specs.videocard}</p>
          <p><span className={styles.label}>Процессор:</span> {specs.processor}</p>
          <p><span className={styles.label}>Монитор:</span> {specs.monitor}</p>
          <p><span className={styles.label}>ОЗУ:</span> {specs.ram}</p>
        </div>
        <h3 className={styles.kitchenTitle}>Кухня</h3>
        <div className={styles.kitchenList}>
  {kitchenItems.map(item => (
    <label key={item.id} className={styles.kitchenItem}>
      <input
        type="checkbox"
        checked={kitchenItemsSelected.includes(item.id)}
        onChange={() => onToggleKitchen(item.id)}
      />
      <span className={styles.kitchenName}>{item.name}</span>
      <span className={styles.kitchenPrice}>{item.price}р</span>
    </label>
  ))}
</div>
        <div className={styles.buttons}>
          <button className={styles.bookBtn} onClick={onBook}>Забронировать</button>
          <button className={styles.closeBtn} onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;