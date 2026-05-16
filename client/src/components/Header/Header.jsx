import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ onBurgerClick }) => {
  const navigate = useNavigate();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.logo} onClick={() => navigate('/')}>
        <img src="/media/logo.svg" alt="Rabbit Cube" className={styles.logoImg} />
        <span className={styles.logoText}>Rabbit Cube</span>
      </div>
      <button
        className={styles.burgerBtn}
        onClick={onBurgerClick}
        aria-label="Открыть меню"
      >
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
        <span className={styles.burgerLine}></span>
      </button>
    </header>
  );
};

export default Header;