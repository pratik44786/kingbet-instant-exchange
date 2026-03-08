import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedUserId } from './useAuthSession';

export interface TransactionData {
  id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export function useTransactions(limit = 50) {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchTransactions = useCallback(async () => {
    const userId = await getCachedUserId();
    if (!userId || !mountedRef.current) { setLoading(false); return; }

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (data && mountedRef.current) {
      setTransactions(data.map(t => ({
        ...t,
        amount: Number(t.amount),
        balance_before: Number(t.balance_before),
        balance_after: Number(t.balance_after),
      })) as TransactionData[]);
    }
    if (mountedRef.current) setLoading(false);
  }, [limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchTransactions();
    return () => { mountedRef.current = false; };
  }, [fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}
