import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/context/AuthContext';

export const useAuthUser = () => {
  const { user } = useAuth();
  return user;
};

export const useHasRole = (role: UserRole): boolean => {
  const { user } = useAuth();
  if (!user) return false;
  if (role === 'admin') return user.role === 'admin' || user.role === 'superadmin';
  return user.role === role;
};
