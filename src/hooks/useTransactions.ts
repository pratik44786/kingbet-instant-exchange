import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchTransactions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (data) setTransactions(data.map(t => ({
      ...t,
      amount: Number(t.amount),
      balance_before: Number(t.balance_before),
      balance_after: Number(t.balance_after),
    })) as TransactionData[]);
    setLoading(false);
  }, [limit]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return { transactions, loading, refetch: fetchTransactions };
}
