import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  userId?: string; // For Admin/SuperAdmin User ID
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: AuthUser, token: string) => void;
  loginWithUserId: (userId: string, user: AuthUser, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
  getUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userIdLogin');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newUser: AuthUser, token: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.removeItem('userIdLogin'); // Clear if previous login was User ID based
      setUser(newUser);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const loginWithUserId = (userId: string, newUser: AuthUser, token: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.setItem('userIdLogin', userId); // Store User ID for reference
      setUser(newUser);
    } catch (error) {
      console.error('Error logging in with User ID:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userIdLogin');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithUserId,
    logout,
    checkAuth,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
