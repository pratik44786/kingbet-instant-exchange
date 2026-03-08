import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedUserId } from './useAuthSession';

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
  const userIdRef = useRef<string | null>(null);
  const mountedRef = useRef(true);

  const fetchWallet = useCallback(async () => {
    const userId = await getCachedUserId();
    if (!userId || !mountedRef.current) { setLoading(false); return; }
    userIdRef.current = userId;

    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data && mountedRef.current) {
      setWallet({
        balance: Number(data.balance),
        bonus_balance: Number(data.bonus_balance),
        exposure: Number(data.exposure),
        total_profit_loss: Number(data.total_profit_loss),
        available: Number(data.balance) - Number(data.exposure),
      });
    }
    if (mountedRef.current) setLoading(false);
  }, []);

  const optimisticDeductStake = useCallback((stake: number) => {
    setWallet(prev => {
      if (!prev) return prev;
      const newBalance = prev.balance - stake;
      const newExposure = prev.exposure + stake;
      return { ...prev, balance: newBalance, exposure: newExposure, available: newBalance - newExposure };
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchWallet();

    const channel = supabase
      .channel('wallet-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'wallets' }, (payload) => {
        if (userIdRef.current && payload.new && (payload.new as any).user_id === userIdRef.current) {
          const d = payload.new as any;
          setWallet({
            balance: Number(d.balance),
            bonus_balance: Number(d.bonus_balance),
            exposure: Number(d.exposure),
            total_profit_loss: Number(d.total_profit_loss),
            available: Number(d.balance) - Number(d.exposure),
          });
        }
      })
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchWallet]);

  return { wallet, loading, refetch: fetchWallet, optimisticDeductStake };
}
