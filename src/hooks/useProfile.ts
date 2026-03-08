import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedUserId } from './useAuthSession';

export interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  role: string;
  parent_id: string | null;
  created_at: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchProfile = useCallback(async () => {
    const userId = await getCachedUserId();
    if (!userId || !mountedRef.current) { setLoading(false); return; }

    // Parallel fetch profile + role
    const [profileRes, roleRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_roles').select('role').eq('user_id', userId).single(),
    ]);

    if (profileRes.data && mountedRef.current) {
      setProfile({
        ...profileRes.data,
        role: roleRes.data?.role || 'user',
      } as ProfileData);
    }
    if (mountedRef.current) setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchProfile();
    return () => { mountedRef.current = false; };
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
