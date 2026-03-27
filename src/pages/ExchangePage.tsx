import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sportsDataService } from '@/services/sportsDataService';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Tv, X, Loader2, ChevronLeft, Activity } from 'lucide-react';
import type { BetSlipItem } from '@/types/exchange';

const sportIcon: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };
const SPORT_IDS: Record<string, number> = { cricket: 4, football: 1, tennis: 2 };

interface MatchItem {
  gmid: string;
  eventName: string;
  competition: string;
  sport: string;
  startTime: string;
  isLive: boolean;
  runners?: any[];
}

// ═══ Match Detail View ═══
const MatchDetail: React.FC<{
  match: MatchItem;
  onBack: () => void;
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => Promise<void>;
}> = ({ match, onBack, betSlip, addToBetSlip, updateBetSlipStake, placeBets }) => {
  const [odds, setOdds] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [tvUrl, setTvUrl] = useState<string | null>(null);
  const [showTV, setShowTV] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    try {
      const [oddsData, scoreData] = await Promise.all([
        sportsDataService.getOdds(match.sport, match.gmid).catch(() => null),
        sportsDataService.getScore(match.sport, match.gmid).catch(() => null),
      ]);
      if (oddsData) setOdds(oddsData);
      if (scoreData) setScore(scoreData);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [match.sport, match.gmid]);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 5000);
    return () => clearInterval(intervalRef.current);
  }, [fetchData]);

  const loadTV = useCallback(async () => {
    setShowTV(true);
    try {
      const tvData = await sportsDataService.getTV(match.sport, match.gmid);
      const url = tvData?.url || tvData?.tvUrl || tvData?.tv_url || tvData?.data?.url || tvData?.iframe || tvData?.streamUrl;
      if (url) setTvUrl(url);
      else if (tvData?.html || tvData?.data?.html) {
        const blob = new Blob([tvData.html || tvData.data.html], { type: 'text/html' });
        setTvUrl(URL.createObjectURL(blob));
      }
    } catch { /* no tv */ }
  }, [match.sport, match.gmid]);

  const runners = odds?.runners || odds?.data?.runners || match.runners || [];
  const scoreText = score?.score || score?.data?.score || score?.scoreText || null;

  return (
    <div className="space-y-3">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-[#1e273e] text-gray-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-black text-foreground uppercase">{match.eventName}</h2>
          <p className="text-[10px] text-muted-foreground">{match.competition}</p>
        </div>
        <div className="flex gap-2">
          {!showTV && (
            <button onClick={loadTV} className="flex items-center gap-1 px-2 py-1 rounded bg-destructive/20 text-destructive text-[10px] font-bold">
              <Tv className="w-3 h-3" /> LIVE TV
            </button>
          )}
          {match.isLive && (
            <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE
            </div>
          )}
        </div>
      </div>

      {/* Live Score */}
      {scoreText && (
        <div className="bg-[#1a2236] rounded-lg p-3 border border-yellow-500/20">
          <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-bold mb-1">
            <Activity className="w-3 h-3" /> LIVE SCORE
          </div>
          <div className="text-sm text-foreground font-bold">
            {typeof scoreText === 'string' ? scoreText : JSON.stringify(scoreText)}
          </div>
        </div>
      )}

      {/* TV */}
      {showTV && (
        <div className="relative bg-black rounded-lg overflow-hidden border border-yellow-500/20">
          <button onClick={() => { setShowTV(false); setTvUrl(null); }} className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/70 text-white">
            <X className="w-4 h-4" />
          </button>
          <div className="bg-gradient-to-r from-red-900/50 to-red-800/30 px-3 py-1.5 flex items-center gap-2">
            <Tv className="w-3 h-3 text-destructive" />
            <span className="text-[10px] font-bold text-destructive uppercase">Live TV</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-destructive animate-pulse" />
          </div>
          <div className="aspect-video bg-gray-950 flex items-center justify-center">
            {tvUrl ? (
              <iframe src={tvUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" sandbox="allow-scripts allow-same-origin allow-popups" title="Live TV" />
            ) : (
              <div className="text-gray-500 text-xs">Loading stream...</div>
            )}
          </div>
        </div>
      )}

      {/* Odds Table */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mx-auto mb-2" />
          <span className="text-xs text-muted-foreground">Loading odds...</span>
        </div>
      ) : (
        <div className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">
          <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-muted-foreground">
            <div className="col-span-6 pl-2">MATCH ODDS</div>
            <div className="col-span-3 text-center text-[#72bbef]">BACK</div>
            <div className="col-span-3 text-center text-[#faa9ba]">LAY</div>
          </div>

          {runners.length === 0 && (
            <div className="px-4 py-3 text-center text-xs text-muted-foreground">No odds available yet</div>
          )}

          {runners.map((r: any, idx: number) => {
            const name = r.RunnerName || r.runnerName || r.name || 'Unknown';
            const backOdds = r.BackPrice1 || r.backPrice1 || r.back_odds || 0;
            const layOdds = r.LayPrice1 || r.layPrice1 || r.lay_odds || 0;
            const runnerId = `betnex-${match.gmid}-${idx}`;
            const slip = betSlip.find(b => b.runnerId === runnerId);

            return (
              <div key={idx} className="border-b border-white/5 last:border-0">
                <div className="grid grid-cols-12 items-center p-1 gap-1 bg-[#161d2f]">
                  <div className="col-span-6 pl-2 text-xs font-bold text-foreground">{name}</div>
                  <div className="col-span-3">
                    <button
                      onClick={() => backOdds > 0 && addToBetSlip({ marketId: match.gmid, runnerId, runnerName: name, eventName: match.eventName, type: 'back', odds: backOdds })}
                      disabled={backOdds === 0}
                      className={`btn-back w-full py-2 ${backOdds === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="odds-text">{backOdds > 0 ? backOdds.toFixed(2) : '-'}</span>
                    </button>
                  </div>
                  <div className="col-span-3">
                    <button
                      onClick={() => layOdds > 0 && addToBetSlip({ marketId: match.gmid, runnerId, runnerName: name, eventName: match.eventName, type: 'lay', odds: layOdds })}
                      disabled={layOdds === 0}
                      className={`btn-lay w-full py-2 ${layOdds === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className="odds-text">{layOdds > 0 ? layOdds.toFixed(2) : '-'}</span>
                    </button>
                  </div>
                </div>

                {slip && (
                  <div className={`m-2 p-3 rounded border-l-4 shadow-2xl ${slip.type === 'back' ? 'bg-[#e2f2ff] border-[#2b92e4]' : 'bg-[#fff0f3] border-[#ef6e8b]'}`}>
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-black text-gray-600 block uppercase mb-1">Stake</label>
                        <input type="number" className="w-full p-2 rounded bg-white text-black font-bold outline-none border border-gray-300" placeholder="Amount" value={slip.stake || ''} onChange={(e) => updateBetSlipStake(runnerId, Number(e.target.value))} />
                      </div>
                      <Button onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 h-10 px-6 font-black rounded-sm shadow-md">PLACE BET</Button>
                      <Button variant="ghost" onClick={() => updateBetSlipStake(runnerId, 0)} className="h-10 text-gray-500 font-bold">CANCEL</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ═══ Main Exchange Page ═══
const ExchangePage: React.FC = () => {
  const { markets, marketsLoading, addToBetSlip, betSlip, updateBetSlipStake, placeBets, refreshData } = useApp();
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [liveMatches, setLiveMatches] = useState<MatchItem[]>([]);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);
  const [useLiveApi, setUseLiveApi] = useState(false);

  // Fetch live matches from Betnex API
  const fetchLiveMatches = useCallback(async () => {
    setFetchingLive(true);
    try {
      const sports = sportFilter === 'all' ? ['cricket', 'football', 'tennis'] : [sportFilter];
      const all: MatchItem[] = [];

      for (const sport of sports) {
        try {
          const data = await sportsDataService.getMatches(sport);
          const matches = Array.isArray(data) ? data : (data?.data || data?.matches || data?.events || []);
          for (const m of matches) {
            all.push({
              gmid: String(m.gmid || m.gameId || m.game_id || ''),
              eventName: m.eventName || m.event_name || m.matchName || 'Unknown',
              competition: m.competition || m.competitionName || sport.toUpperCase(),
              sport,
              startTime: m.startTime || m.start_time || m.openDate || new Date().toISOString(),
              isLive: true,
              runners: m.runners,
            });
          }
        } catch { /* skip */ }
      }
      setLiveMatches(all);
      setUseLiveApi(all.length > 0);
    } catch { /* ignore */ } finally {
      setFetchingLive(false);
    }
  }, [sportFilter]);

  useEffect(() => {
    fetchLiveMatches();
  }, [fetchLiveMatches]);

  // Fallback to DB markets
  const filtered = useMemo(() => sportFilter === 'all' ? markets : markets.filter(m => m.sport === sportFilter), [markets, sportFilter]);
  const now = useMemo(() => Date.now(), [markets]);
  const dbLiveMarkets = useMemo(() => filtered.filter(m => new Date(m.start_time).getTime() <= now), [filtered, now]);
  const upcomingMarkets = useMemo(() => filtered.filter(m => new Date(m.start_time).getTime() > now), [filtered, now]);

  if (selectedMatch) {
    return (
      <div className="p-2 lg:p-4 max-w-6xl mx-auto">
        <MatchDetail
          match={selectedMatch}
          onBack={() => setSelectedMatch(null)}
          betSlip={betSlip}
          addToBetSlip={addToBetSlip}
          updateBetSlipStake={updateBetSlipStake}
          placeBets={placeBets}
        />
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-4 max-w-6xl mx-auto space-y-4">
      {/* Sport Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'cricket', 'football', 'tennis'].map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              sportFilter === s ? 'bg-yellow-600 text-white' : 'bg-[#1e273e] text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? '🔥 All' : `${sportIcon[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
        <button onClick={() => { refreshData(); fetchLiveMatches(); }} className="ml-auto p-2 text-gray-500 hover:text-yellow-500">
          <RefreshCw className={`w-4 h-4 ${fetchingLive ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {(marketsLoading || fetchingLive) && liveMatches.length === 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500 mx-auto mb-3" />
          Loading matches...
        </div>
      )}

      {/* Live Matches from Betnex API */}
      {liveMatches.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE MATCHES ({liveMatches.length})
          </div>
          <div className="space-y-2">
            {liveMatches.map((m) => (
              <button
                key={m.gmid}
                onClick={() => setSelectedMatch(m)}
                className="w-full bg-[#161d2f] rounded-lg border border-white/5 hover:border-yellow-500/30 transition-colors p-3 text-left"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sportIcon[m.sport] || '🏆'}</span>
                    <div>
                      <span className="font-black text-sm uppercase text-foreground">{m.eventName}</span>
                      <p className="text-[10px] text-muted-foreground">{m.competition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* DB Markets fallback (when no live API data) */}
      {!useLiveApi && dbLiveMarkets.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE MATCHES ({dbLiveMarkets.length})
          </div>
          {dbLiveMarkets.map(m => (
            <div key={m.id} className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">
              <div className="bg-[#1e273e] p-3 flex justify-between items-center border-b border-yellow-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sportIcon[m.sport] || '🏆'}</span>
                  <div>
                    <span className="font-black text-sm uppercase italic text-foreground">{m.event_name}</span>
                    <p className="text-[10px] text-muted-foreground">{m.competition}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-muted-foreground">
                <div className="col-span-6 pl-2">MATCH ODDS</div>
                <div className="col-span-3 text-center text-[#72bbef]">BACK</div>
                <div className="col-span-3 text-center text-[#faa9ba]">LAY</div>
              </div>
              {m.runners.map((runner) => (
                <div key={runner.id} className="grid grid-cols-12 items-center p-1 gap-1 bg-[#161d2f] border-b border-white/5">
                  <div className="col-span-6 pl-2 text-xs font-bold text-foreground">{runner.name}</div>
                  <div className="col-span-3">
                    <button onClick={() => addToBetSlip({ marketId: m.id, runnerId: runner.id, runnerName: runner.name, eventName: m.event_name, type: 'back', odds: runner.back_odds })} className="btn-back w-full py-2">
                      <span className="odds-text">{runner.back_odds.toFixed(2)}</span>
                    </button>
                  </div>
                  <div className="col-span-3">
                    <button onClick={() => addToBetSlip({ marketId: m.id, runnerId: runner.id, runnerName: runner.name, eventName: m.event_name, type: 'lay', odds: runner.lay_odds })} className="btn-lay w-full py-2">
                      <span className="odds-text">{runner.lay_odds.toFixed(2)}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {/* Upcoming */}
      {upcomingMarkets.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-500 mt-4">
            🕐 UPCOMING MATCHES ({upcomingMarkets.length})
          </div>
          {upcomingMarkets.map(m => (
            <div key={m.id} className="bg-[#161d2f] rounded-lg border border-white/5 p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{sportIcon[m.sport] || '🏆'}</span>
                  <div>
                    <span className="font-black text-sm uppercase text-foreground">{m.event_name}</span>
                    <p className="text-[10px] text-muted-foreground">{m.competition}</p>
                  </div>
                </div>
                <div className="text-[10px] text-yellow-500 font-bold">
                  🕐 {new Date(m.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(m.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {!marketsLoading && !fetchingLive && liveMatches.length === 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No matches available right now.</p>
          <p className="text-xs mt-1">Pull to refresh or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
