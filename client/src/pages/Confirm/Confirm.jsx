import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmEmail } from '../../store/authSlice';

const Confirm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuth, loading, error } = useSelector(state => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(confirmEmail(token));
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (isAuth) {
      navigate('/profile', { replace: true });
    }
  }, [isAuth, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Подтверждение...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '50px' }}>Ошибка: {error}</div>;

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Подтверждение...</h1>
    </div>
  );
};

export default Confirm;