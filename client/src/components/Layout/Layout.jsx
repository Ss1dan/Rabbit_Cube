import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import BurgerMenu from '../BurgerMenu/BurgerMenu';

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <Header onBurgerClick={() => setMenuOpen(true)} />
      <BurgerMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <Outlet />
    </>
  );
};

export default Layout;