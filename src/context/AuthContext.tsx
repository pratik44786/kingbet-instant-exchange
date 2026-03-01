import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: UserRole;
  userId?: string; // For Admin/SuperAdmin User ID authentication
  balance?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Login methods
  login: (user: AuthUser, token: string) => void;
  loginWithUserId: (userId: string, user: AuthUser, token: string) => void;
  
  // Logout
  logout: () => void;
  
  // Auth checks
  checkAuth: () => void;
  getUserRole: () => UserRole | null;
  
  // Clear error
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (from localStorage) on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser) as AuthUser;
        setUser(parsedUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      // Clear corrupted storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userIdLogin');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newUser: AuthUser, token: string) => {
    try {
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(newUser));
      localStorage.removeItem('userIdLogin'); // Clear if previous login was User ID based
      setUser(newUser);
      setError(null);
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Failed to save session. Please try again.');
    }
  }, []);

  const loginWithUserId = useCallback(
    (userId: string, newUser: AuthUser, token: string) => {
      try {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(newUser));
        localStorage.setItem('userIdLogin', userId); // Store User ID for reference
        setUser(newUser);
        setError(null);
      } catch (err) {
        console.error('Error logging in with User ID:', err);
        setError('Failed to save session. Please try again.');
      }
    },
    []
  );

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      localStorage.removeItem('userIdLogin');
      setUser(null);
      setError(null);
      // Redirect to login page
      window.location.href = '/login';
    } catch (err) {
      console.error('Error logging out:', err);
      // Force redirect even on error
      window.location.href = '/login';
    }
  }, []);

  const getUserRole = useCallback((): UserRole | null => {
    return user?.role || null;
  }, [user?.role]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithUserId,
    logout,
    checkAuth,
    getUserRole,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context with error handling
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
