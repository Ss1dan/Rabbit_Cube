import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComputers } from '../../store/computerSlice';
import { fetchKitchenItems } from '../../store/kitchenSlice';
import styles from './PriceList.module.css';

const PriceList = () => {
  const dispatch = useDispatch();
  const { list: computers, loading: computersLoading } = useSelector(state => state.computers);
  const { items: kitchenItems, loading: kitchenLoading } = useSelector(state => state.kitchen);

  useEffect(() => {
    document.title = 'Rabbit Cube — Прайс Лист';
    dispatch(fetchComputers());
    dispatch(fetchKitchenItems());
  }, [dispatch]);

  if (computersLoading || kitchenLoading) return <div className={styles.loading}>Загрузка...</div>;

  const standardPC = computers.find(c => c.type === 'Standard');
  const vipPC = computers.find(c => c.type === 'VIP');
  const ps5PC = computers.find(c => c.type === 'PS5');

  const getSpecs = (computer) => {
    if (!computer) return null;
    return typeof computer.specs === 'string' ? JSON.parse(computer.specs) : computer.specs;
  };

  const standardSpecs = getSpecs(standardPC);
  const vipSpecs = getSpecs(vipPC);
  const ps5Specs = getSpecs(ps5PC);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        {standardPC && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>PC-Standart</h2>
            <p className={styles.specs}>
              Видеокарта: {standardSpecs?.videocard}<br/>
              Процессор: {standardSpecs?.processor}<br/>
              Оперативная память: {standardSpecs?.ram}<br/>
              Монитор: {standardSpecs?.monitor}
            </p>
            <div className={styles.price}>
              <span className={styles.priceValue}>{standardPC.price_per_hour}р</span>
              <span className={styles.priceUnit}>За целый час брони</span>
            </div>
          </div>
        )}
        {vipPC && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>PC - VIP</h2>
            <p className={styles.specs}>
              Видеокарта: {vipSpecs?.videocard}<br/>
              Процессор: {vipSpecs?.processor}<br/>
              Оперативная память: {vipSpecs?.ram}<br/>
              Монитор: {vipSpecs?.monitor}
            </p>
            <div className={styles.price}>
              <span className={styles.priceValue}>{vipPC.price_per_hour}р</span>
              <span className={styles.priceUnit}>За целый час брони</span>
            </div>
          </div>
        )}
      </div>

      {ps5PC && (
        <div className={styles.fullCard}>
          <h2 className={styles.cardTitle}>PlayStation 5</h2>
          <p className={styles.specs}>
            Видеокарта: {ps5Specs?.videocard}<br/>
            Процессор: {ps5Specs?.processor}<br/>
            Оперативная память: {ps5Specs?.ram}<br/>
            Монитор: {ps5Specs?.monitor}
          </p>
          <div className={styles.price}>
            <span className={styles.priceValue}>{ps5PC.price_per_hour}р</span>
            <span className={styles.priceUnit}>За целый час брони</span>
          </div>
        </div>
      )}

      <h2 className={styles.kitchenTitle}>Кухня</h2>
      <div className={styles.kitchenList}>
        {kitchenItems.map(item => (
          <div key={item.id} className={styles.kitchenItem}>
            <span className={styles.kitchenName}>{item.name}</span>
            <span className={styles.kitchenPrice}>{item.price}р</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceList;