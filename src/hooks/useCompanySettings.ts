import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CompanySettings {
  id: string;
  company_name: string;
  ceo_name: string | null;
  founder_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  office_address: string | null;
  twitter_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  tagline: string | null;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase.from('company_settings').select('*').order('created_at').limit(1).maybeSingle();
    setSettings(data as CompanySettings | null);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return { settings, loading, refresh: load };
}
