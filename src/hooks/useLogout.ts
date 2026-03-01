import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useCallback } from 'react';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login', { replace: true });
    }
  }, [logout, navigate]);

  return { handleLogout };
};
