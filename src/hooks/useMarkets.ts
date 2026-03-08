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
  const mountedRef = useRef(true);
  const visibleRef = useRef(true);

  const fetchMarkets = useCallback(async () => {
    // Skip fetch if tab is hidden (save bandwidth for 100K users)
    if (!visibleRef.current || !mountedRef.current) return;

    let query = supabase.from('markets').select(`*, runners(*)`).in('status', ['open', 'suspended']);
    if (sport) query = query.eq('sport', sport as any);
    query = query.order('start_time', { ascending: true }).limit(50);

    const { data } = await query;
    if (data && mountedRef.current) {
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
    if (mountedRef.current) setLoading(false);
  }, [sport]);

  const syncOdds = useCallback(async () => {
    try {
      await supabase.functions.invoke('odds-fetcher');
      await fetchMarkets();
    } catch (err) {
      console.error('Odds sync error:', err);
    }
  }, [fetchMarkets]);

  useEffect(() => {
    mountedRef.current = true;
    visibleRef.current = !document.hidden;

    // Pause polling when tab is hidden
    const handleVisibility = () => {
      visibleRef.current = !document.hidden;
      if (!document.hidden) fetchMarkets(); // Refresh when coming back
    };
    document.addEventListener('visibilitychange', handleVisibility);

    fetchMarkets();
    syncOdds();

    timerRef.current = setInterval(() => {
      if (visibleRef.current) fetchMarkets();
    }, pollInterval);

    return () => {
      mountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibility);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchMarkets, syncOdds, pollInterval]);

  return { markets, loading, refetch: fetchMarkets, syncOdds };
}
