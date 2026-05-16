import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { HiSun, HiMoon } from 'react-icons/hi';
import { useTheme } from '../../hooks/useTheme';
import styles from './BurgerMenu.module.css';

const BurgerMenu = ({ isOpen, onClose }) => {
  const { roles } = useSelector(state => state.auth);
  const overlayRef = useRef(null);
  const menuRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="overlay"
        unmountOnExit
        nodeRef={overlayRef}
      >
        <div
          className={styles.overlay}
          onClick={onClose}
          ref={overlayRef}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClose(); }}
          aria-label="Закрыть меню"
        />
      </CSSTransition>

      <CSSTransition
        in={isOpen}
        timeout={300}
        classNames="menu-slide"
        unmountOnExit
        nodeRef={menuRef}
      >
        <nav className={styles.menu} ref={menuRef} role="navigation" aria-label="Главное меню">
          <div className={styles.logo} onClick={onClose}>
            <img src="/media/logo.svg" alt="Rabbit Cube" />
            <span>Rabbit Cube</span>
          </div>
          <ul>
            <li><NavLink to="/profile" onClick={onClose}>Личный кабинет</NavLink></li>
            <li><NavLink to="/booking" onClick={onClose}>Бронирование</NavLink></li>
            <li><NavLink to="/price" onClick={onClose}>Прайс Лист</NavLink></li>
            {roles.includes('Admin') && (
              <li><NavLink to="/admin" onClick={onClose}>Админ панель</NavLink></li>
            )}
          </ul>
          <div
            className={styles.themeToggle}
            onClick={toggleTheme}
            role="button"
            tabIndex={0}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleTheme(); }}
          >
            {theme === 'dark' ? <HiMoon size={24} /> : <HiSun size={24} />}
            <span className={styles.themeLabel}>
              {theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
            </span>
          </div>
        </nav>
      </CSSTransition>
    </>
  );
};

export default BurgerMenu;