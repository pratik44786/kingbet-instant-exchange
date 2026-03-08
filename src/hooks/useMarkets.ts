import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RunnerData {
  id: string;
  name: string;
  back_odds: number;
  lay_odds: number;
  back_size: number;
  lay_size: number;
  is_winner: boolean | null;
  sort_order: number;
}

export interface MarketData {
  id: string;
  event_name: string;
  competition: string;
  sport: string;
  status: string;
  start_time: string;
  runners: RunnerData[];
}

export function useMarkets(sport?: string, pollInterval = 15000) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMarkets = useCallback(async () => {
    let query = supabase.from('markets').select(`
      *,
      runners(*)
    `).in('status', ['open', 'suspended']);

    if (sport) query = query.eq('sport', sport as any);
    query = query.order('start_time', { ascending: true }).limit(50);

    const { data } = await query;
    if (data) {
      setMarkets(data.map(m => ({
        ...m,
        runners: (m.runners || []).map((r: any) => ({
          ...r,
          back_odds: Number(r.back_odds),
          lay_odds: Number(r.lay_odds),
          back_size: Number(r.back_size),
          lay_size: Number(r.lay_size),
        })).sort((a: RunnerData, b: RunnerData) => a.sort_order - b.sort_order),
      })) as MarketData[]);
    }
    setLoading(false);
  }, [sport]);

  // Trigger a sync from the odds-fetcher edge function
  const syncOdds = useCallback(async () => {
    try {
      await supabase.functions.invoke('odds-fetcher', {
        body: null,
      });
      await fetchMarkets();
    } catch (err) {
      console.error('Odds sync error:', err);
    }
  }, [fetchMarkets]);

  useEffect(() => {
    // Initial fetch from DB
    fetchMarkets();
    // Initial sync from API
    syncOdds();

    // Poll every pollInterval ms
    timerRef.current = setInterval(() => {
      fetchMarkets();
    }, pollInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchMarkets, syncOdds, pollInterval]);

  return { markets, loading, refetch: fetchMarkets, syncOdds };
}
