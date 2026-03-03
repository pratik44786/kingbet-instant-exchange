import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'superadmin';

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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
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
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, display_name, email, status')
        .eq('id', authUser.id)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authUser.id)
        .single();

      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', authUser.id)
        .single();

      if (profile?.status === 'blocked' || profile?.status === 'suspended') {
        await supabase.auth.signOut();
        setError('Your account has been ' + profile.status);
        setUser(null);
        return;
      }

      setUser({
        id: authUser.id,
        username: profile?.username || authUser.email?.split('@')[0] || 'User',
        email: profile?.email || authUser.email,
        role: (roleData?.role as UserRole) || 'user',
        balance: wallet ? Number(wallet.balance) : 0,
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
      setUser({
        id: authUser.id,
        username: authUser.email?.split('@')[0] || 'User',
        email: authUser.email,
        role: 'user',
        balance: 0,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await fetchUserProfile(newSession.user);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username: string) => {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setError(null);
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
