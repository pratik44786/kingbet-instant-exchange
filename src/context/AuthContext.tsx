import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearCachedUserId } from '@/hooks/useAuthSession';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'superadmin';

const EMAIL_DOMAIN = 'kingbet.local';

/** Map a plain userId string to the internal email used by Supabase Auth */
function toInternalEmail(userId: string): string {
  if (userId.includes('@')) return userId; // already an email (legacy compat)
  return `${userId.toLowerCase().trim()}@${EMAIL_DOMAIN}`;
}

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  balance?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (userId: string, password: string) => Promise<void>;
  register: (userId: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getUserRole: () => UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      // Parallel fetch all user data at once — reduces 3 sequential calls to 1 round-trip
      const [profileRes, roleRes, walletRes] = await Promise.all([
        supabase.from('profiles').select('username, display_name, email, status').eq('id', authUser.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', authUser.id).single(),
        supabase.from('wallets').select('balance').eq('user_id', authUser.id).single(),
      ]);

      const profile = profileRes.data;
      const roleData = roleRes.data;
      const wallet = walletRes.data;

      if (profile?.status === 'blocked' || profile?.status === 'suspended') {
        await supabase.auth.signOut();
        setError('Your account has been ' + profile.status + '. Contact your admin.');
        setUser(null);
        return;
      }

      setUser({
        id: authUser.id,
        username: profile?.username || authUser.user_metadata?.username || 'User',
        email: profile?.email || authUser.email,
        role: (roleData?.role as UserRole) || 'user',
        balance: wallet ? Number(wallet.balance) : 0,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUser({
        id: authUser.id,
        username: authUser.user_metadata?.username || 'User',
        email: authUser.email,
        role: 'user',
        balance: 0,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let loadingTimeout: ReturnType<typeof setTimeout>;

    const initAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(existingSession);
        if (existingSession?.user) {
          await fetchUserProfile(existingSession.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Session init error:', err);
        setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Safety timeout: never stay loading for more than 8 seconds
    loadingTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth loading timeout — forcing ready state');
        setIsLoading(false);
      }
    }, 8000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          // Fire-and-forget to avoid deadlock — never await inside onAuthStateChange
          fetchUserProfile(newSession.user).finally(() => {
            if (mounted) setIsLoading(false);
          });
        } else {
          setUser(null);
          if (mounted) setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (userId: string, password: string) => {
    setError(null);
    const email = toInternalEmail(userId);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('Invalid User ID or password');
      throw signInError;
    }
  }, []);

  const register = useCallback(async (userId: string, password: string, username?: string) => {
    setError(null);
    const email = toInternalEmail(userId);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username || userId } },
    });
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
  }, []);

  const logout = useCallback(async () => {
    clearCachedUserId();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setError(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('userIdLogin');
  }, []);

  const getUserRole = useCallback(() => user?.role || null, [user?.role]);
  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      error,
      login,
      register,
      logout,
      clearError,
      getUserRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
