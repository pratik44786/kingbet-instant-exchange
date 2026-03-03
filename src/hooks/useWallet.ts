import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WalletData {
  balance: number;
  bonus_balance: number;
  exposure: number;
  total_profit_loss: number;
  available: number;
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error && data) {
      setWallet({
        balance: Number(data.balance),
        bonus_balance: Number(data.bonus_balance),
        exposure: Number(data.exposure),
        total_profit_loss: Number(data.total_profit_loss),
        available: Number(data.balance) - Number(data.exposure),
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWallet();

    // Subscribe to wallet changes
    const channel = supabase
      .channel('wallet-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        fetchWallet();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchWallet]);

  return { wallet, loading, refetch: fetchWallet };
}
