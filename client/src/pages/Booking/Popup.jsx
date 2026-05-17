import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import API from '../../api';
import styles from './Popup.module.css';
import { fetchKitchenItems } from '../../store/kitchenSlice';

const ITEMS_PER_PAGE = 5; // сколько позиций показывать на одной странице

const Popup = ({ onClose, onBook, kitchenItemsSelected, onToggleKitchen }) => {
  const selectedPlaceId = useSelector(state => state.booking.selectedPlace);
  const [computer, setComputer] = useState(null);
  const dispatch = useDispatch();
  const kitchenItems = useSelector(state => state.kitchen.items);
  const [kitchenPage, setKitchenPage] = useState(1);

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

  // Пагинация
  const totalPages = Math.ceil(kitchenItems.length / ITEMS_PER_PAGE);
  const paginatedItems = kitchenItems.slice(
    (kitchenPage - 1) * ITEMS_PER_PAGE,
    kitchenPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setKitchenPage(page);
  };

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
          {paginatedItems.map(item => (
            <label key={item.id} className={styles.kitchenItem}>
              <input
                type="checkbox"
                checked={kitchenItemsSelected.includes(item.id)}
                onChange={() => onToggleKitchen(item.id)}
              />
              <span>{item.name} ({item.price}р)</span>
            </label>
          ))}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageBtn} ${page === kitchenPage ? styles.activePage : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}

        <div className={styles.buttons}>
          <button className={styles.bookBtn} onClick={onBook}>Забронировать</button>
          <button className={styles.closeBtn} onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;