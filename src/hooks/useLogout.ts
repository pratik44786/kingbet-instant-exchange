import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useLogout = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      // Optional: Call API endpoint to invalidate token on backend
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if API call fails
      logout();
      navigate('/login', { replace: true });
    }
  };

  return { handleLogout };
};
