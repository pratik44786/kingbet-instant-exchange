import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface WalletData {
  balance: number;
  active_investment: number;
  referral_earnings: number;
  pending_withdrawal: number;
  total_profit_loss: number;
}

export function useWallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setWallet(null); setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('wallets').select('*').eq('user_id', user.id).maybeSingle();
    setWallet(data ? {
      balance: Number(data.balance) || 0,
      active_investment: Number(data.active_investment) || 0,
      referral_earnings: Number(data.referral_earnings) || 0,
      pending_withdrawal: Number(data.pending_withdrawal) || 0,
      total_profit_loss: Number(data.total_profit_loss) || 0,
    } : null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  return { wallet, loading, refresh: fetch };
}
