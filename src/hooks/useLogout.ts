import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      // Optional: Call API endpoint to invalidate token on backend
      // const token = localStorage.getItem('authToken');
      // if (token) {
      //   await fetch('/api/auth/logout', {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json',
      //     },
      //   });
      // }

      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  return { handleLogout };
};
