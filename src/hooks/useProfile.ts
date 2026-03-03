import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileData) {
      setProfile({
        ...profileData,
        role: roleData?.role || 'user',
      } as ProfileData);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
