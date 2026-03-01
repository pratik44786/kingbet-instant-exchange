import { useAuth } from '@/context/AuthContext';
import { useCallback } from 'react';

export const useLogout = () => {
  const { logout } = useAuth();

  const handleLogout = useCallback(() => {
    // AuthContext.logout() clears storage, resets user state, and redirects to /login
    logout();
  }, [logout]);

  return { handleLogout };
};
