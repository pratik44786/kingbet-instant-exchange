import { useState, useEffect, useCallback } from 'react';
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

export function useMarkets(sport?: string) {
  const [markets, setMarkets] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchMarkets(); }, [fetchMarkets]);

  return { markets, loading, refetch: fetchMarkets };
}
