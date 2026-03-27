import { supabase } from '@/integrations/supabase/client';

const SPORT_IDS: Record<string, number> = { cricket: 4, football: 1, tennis: 2 };

async function callSportsData(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const session = (await supabase.auth.getSession()).data.session;

  const resp = await fetch(`${supabaseUrl}/functions/v1/sports-data?${query}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    },
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}

export const sportsDataService = {
  getSports: () => callSportsData({ action: 'sports' }),

  getMatches: (sport: string) =>
    callSportsData({ action: 'matches', sportsid: String(SPORT_IDS[sport] ?? 4) }),

  getOdds: (sport: string, gmids: string | string[]) =>
    callSportsData({
      action: 'odds',
      sportsid: String(SPORT_IDS[sport] ?? 4),
      gmid: Array.isArray(gmids) ? gmids.join(',') : gmids,
    }),

  getTV: (sport: string, gmid: string) =>
    callSportsData({ action: 'tv', sportsid: String(SPORT_IDS[sport] ?? 4), gmid }),

  getScore: (sport: string, gmid: string) =>
    callSportsData({ action: 'score', sportsid: String(SPORT_IDS[sport] ?? 4), gmid }),

  getResult: (sport: string, gmid: string) =>
    callSportsData({ action: 'result', sportsid: String(SPORT_IDS[sport] ?? 4), gmid }),
};
