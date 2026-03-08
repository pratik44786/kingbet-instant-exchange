import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCachedUserId } from './useAuthSession';

export interface BetData {
  id: string;
  market_id: string | null;
  runner_id: string | null;
  game_type: string | null;
  bet_type: string;
  odds: number;
  stake: number;
  potential_profit: number;
  actual_profit: number | null;
  exposure: number;
  status: string;
  created_at: string;
  settled_at: string | null;
}

export function useBets(filters?: { status?: string; limit?: number }) {
  const [bets, setBets] = useState<BetData[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchBets = useCallback(async () => {
    const userId = await getCachedUserId();
    if (!userId || !mountedRef.current) { setLoading(false); return; }

    let query = supabase.from('bets').select('*').eq('user_id', userId);
    if (filters?.status) query = query.eq('status', filters.status as any);
    query = query.order('created_at', { ascending: false }).limit(filters?.limit || 50);

    const { data } = await query;
    if (data && mountedRef.current) {
      setBets(data.map(b => ({
        ...b,
        odds: Number(b.odds),
        stake: Number(b.stake),
        potential_profit: Number(b.potential_profit),
        actual_profit: b.actual_profit ? Number(b.actual_profit) : null,
        exposure: Number(b.exposure),
      })) as BetData[]);
    }
    if (mountedRef.current) setLoading(false);
  }, [filters?.status, filters?.limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBets();
    return () => { mountedRef.current = false; };
  }, [fetchBets]);

  return { bets, loading, refetch: fetchBets };
}
