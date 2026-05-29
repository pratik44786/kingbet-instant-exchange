import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'user' | 'admin' | 'master_admin' | 'superadmin';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  referralCode?: string;
  role: UserRole;
  kycStatus: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  referralCode?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = useCallback(async (authUser: User) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from('profiles').select('username, full_name, email, referral_code, kyc_status').eq('id', authUser.id).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', authUser.id).maybeSingle(),
      ]);
      const profile = profileRes.data;
      setUser({
        id: authUser.id,
        email: profile?.email || authUser.email || '',
        username: profile?.username || authUser.email?.split('@')[0] || 'User',
        fullName: profile?.full_name || undefined,
        referralCode: profile?.referral_code || undefined,
        role: (roleRes.data?.role as UserRole) || 'user',
        kycStatus: profile?.kyc_status || 'pending',
      });
    } catch (err) {
      console.error('Profile fetch error:', err);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.email?.split('@')[0] || 'User',
        role: 'user',
        kycStatus: 'pending',
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession?.user) {
        setTimeout(() => mounted && fetchUserProfile(newSession.user), 0);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      if (!mounted) return;
      setSession(existing);
      if (existing?.user) fetchUserProfile(existing.user).finally(() => mounted && setIsLoading(false));
      else setIsLoading(false);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (err) { setError(err.message); throw err; }
  }, []);

  const register = useCallback(async ({ email, password, fullName, phone, referralCode }: RegisterPayload) => {
    setError(null);
    const { error: err } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName,
          username: email.split('@')[0],
          phone: phone || null,
          referral_code: referralCode?.toUpperCase() || null,
        },
      },
    });
    if (err) { setError(err.message); throw err; }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null); setSession(null); setError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await fetchUserProfile(session.user);
  }, [session, fetchUserProfile]);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, isLoading, error, login, register, logout, clearError: () => setError(null), refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
