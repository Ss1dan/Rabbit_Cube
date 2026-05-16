import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './store/authSlice';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login/Login';
import Register from './pages/Auth/Register/Register';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/EditProfile/EditProfile';
import PriceList from './pages/PriceList/PriceList';
import Booking from './pages/Booking/Booking';
import Admin from './pages/Admin/Admin';
import Confirm from './pages/Confirm/Confirm';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';

function App() {
  const dispatch = useDispatch();
  const { isAuth, roles, checked } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!checked) return <div>Загрузка...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/profile" />} />
          <Route path="/profile" element={isAuth ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/profile/edit" element={isAuth ? <EditProfile /> : <Navigate to="/login" />} />
          <Route path="/price" element={<PriceList />} />
          <Route path="/booking" element={isAuth ? <Booking /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuth && roles.includes('Admin') ? <Admin /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;