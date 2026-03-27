import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sportsDataService } from '@/services/sportsDataService';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Tv, X, Loader2, ChevronLeft, Activity } from 'lucide-react';
import type { BetSlipItem } from '@/types/exchange';

const sportIcon: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };

interface BetnexRunner {
  nat: string;
  sid: number;
  odds: { odds: number; otype: string; size: number; oname?: string }[];
  gstatus: string;
}

interface BetnexMatch {
  gmid: number;
  ename: string;
  cname: string;
  stime: string;
  status: string;
  tv: boolean;
  bm: boolean;
  section: BetnexRunner[];
  gtype: string;
  mname: string;
}

interface MatchItem {
  gmid: string;
  eventName: string;
  competition: string;
  sport: string;
  startTime: string;
  isLive: boolean;
  hasTV: boolean;
  runners: { name: string; backOdds: number; backSize: number; layOdds: number; laySize: number; sid: number }[];
}

function parseBetnexMatches(data: any, sport: string): MatchItem[] {
  const t1 = data?.data?.t1 || data?.t1 || [];
  return t1.map((m: BetnexMatch) => {
    const runners = (m.section || []).map((s: BetnexRunner) => {
      const back = s.odds?.find(o => o.otype === 'back') || { odds: 0, size: 0 };
      const lay = s.odds?.find(o => o.otype === 'lay') || { odds: 0, size: 0 };
      return { name: s.nat, backOdds: back.odds, backSize: back.size, layOdds: lay.odds, laySize: lay.size, sid: s.sid };
    });
    const startDate = m.stime ? new Date(m.stime) : new Date();
    return {
      gmid: String(m.gmid),
      eventName: m.ename,
      competition: m.cname || sport.toUpperCase(),
      sport,
      startTime: startDate.toISOString(),
      isLive: m.status === 'OPEN' && startDate.getTime() <= Date.now(),
      hasTV: m.tv,
      runners,
    };
  });
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
  const [odds, setOdds] = useState<MatchItem['runners']>(match.runners);
  const [scoreUrl, setScoreUrl] = useState<string | null>(null);
  const [tvUrl, setTvUrl] = useState<string | null>(null);
  const [tvError, setTvError] = useState<string | null>(null);
  const [showTV, setShowTV] = useState(false);
  const [showScore, setShowScore] = useState(true);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    try {
      const [oddsData, scoreData] = await Promise.all([
        sportsDataService.getOdds(match.sport, match.gmid).catch(() => null),
        sportsDataService.getScore(match.sport, match.gmid).catch(() => null),
      ]);
      if (oddsData) {
        // Betnex odds format: { data: { odds: { gmid: [ { section: [...] } ] } } }
        const oddsMap = oddsData?.data?.odds || {};
        const matchOdds = oddsMap[match.gmid] || [];
        // Find MATCH_ODDS market (gtype=match, mname=MATCH_ODDS)
        const matchMarket = matchOdds.find((m: any) => m.mname === 'MATCH_ODDS') || matchOdds[0];
        if (matchMarket?.section) {
          const parsed = matchMarket.section.map((s: BetnexRunner) => {
            const back = s.odds?.find(o => o.otype === 'back' && o.oname === 'back1') || s.odds?.find(o => o.otype === 'back') || { odds: 0, size: 0 };
            const lay = s.odds?.find(o => o.otype === 'lay' && o.oname === 'lay1') || s.odds?.find(o => o.otype === 'lay') || { odds: 0, size: 0 };
            return { name: s.nat, backOdds: back.odds, backSize: back.size, layOdds: lay.odds, laySize: lay.size, sid: s.sid };
          });
          if (parsed.length > 0) setOdds(parsed);
        }
      }
      // Score returns { data: { scoreurl: "https://..." } }
      if (scoreData?.data?.scoreurl) {
        setScoreUrl(scoreData.data.scoreurl);
      }
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
    setTvError(null);
    try {
      const tvData = await sportsDataService.getTV(match.sport, match.gmid);
      // Betnex TV may return { data: { tvurl: "..." } } or { data: { url: "..." } }
      const url = tvData?.data?.tvurl || tvData?.data?.url || tvData?.data?.tv_url ||
                  tvData?.url || tvData?.tvUrl || tvData?.tv_url || tvData?.iframe || tvData?.streamUrl;
      if (url) {
        setTvUrl(url);
      } else {
        setTvError('TV stream is not available for this match');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('limit') || msg.includes('exhausted') || msg.includes('upgrade')) {
        setTvError('TV stream quota exhausted. Please try again later.');
      } else {
        setTvError('TV stream not available for this match');
      }
    }
  }, [match.sport, match.gmid]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg bg-[#1e273e] text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-black text-foreground uppercase">{match.eventName}</h2>
          <p className="text-[10px] text-muted-foreground">{match.competition}</p>
        </div>
        <div className="flex gap-2">
          {!showTV && match.hasTV && (
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

      {/* Live Score iframe */}
      {scoreUrl && showScore && (
        <div className="bg-[#1a2236] rounded-lg overflow-hidden border border-yellow-500/20">
          <div className="flex items-center justify-between px-3 py-1.5 bg-[#121a2d]">
            <div className="flex items-center gap-2 text-[10px] text-yellow-500 font-bold">
              <Activity className="w-3 h-3" /> LIVE SCORE
            </div>
            <button onClick={() => setShowScore(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </div>
          <iframe src={scoreUrl} className="w-full h-32 bg-black" title="Live Score" sandbox="allow-scripts allow-same-origin" />
        </div>
      )}

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
            ) : tvError ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
                <Tv className="w-10 h-10 opacity-30" />
                <span className="text-xs text-center">{tvError}</span>
                <button onClick={loadTV} className="text-[10px] text-yellow-500 hover:text-yellow-400 font-bold mt-1">Retry</button>
              </div>
            ) : (
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            )}
          </div>
        </div>
      )}

      {/* Odds Table */}
      <div className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">
        <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-muted-foreground">
          <div className="col-span-4 pl-2">MATCH ODDS</div>
          <div className="col-span-2 text-center text-[#72bbef]">BACK</div>
          <div className="col-span-2 text-center text-[10px] text-muted-foreground">SIZE</div>
          <div className="col-span-2 text-center text-[#faa9ba]">LAY</div>
          <div className="col-span-2 text-center text-[10px] text-muted-foreground">SIZE</div>
        </div>

        {odds.length === 0 && (
          <div className="px-4 py-3 text-center text-xs text-muted-foreground">No odds available</div>
        )}

        {odds.map((r, idx) => {
          const runnerId = `betnex-${match.gmid}-${r.sid}`;
          const slip = betSlip.find(b => b.runnerId === runnerId);

          return (
            <div key={idx} className="border-b border-white/5 last:border-0">
              <div className="grid grid-cols-12 items-center p-1 gap-1 bg-[#161d2f]">
                <div className="col-span-4 pl-2 text-xs font-bold text-foreground truncate">{r.name}</div>
                <div className="col-span-2">
                  <button
                    onClick={() => r.backOdds > 0 && addToBetSlip({ marketId: match.gmid, runnerId, runnerName: r.name, eventName: match.eventName, type: 'back', odds: r.backOdds })}
                    disabled={r.backOdds === 0}
                    className={`btn-back w-full py-2 ${r.backOdds === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="odds-text">{r.backOdds > 0 ? r.backOdds.toFixed(2) : '-'}</span>
                  </button>
                </div>
                <div className="col-span-2 text-center text-[9px] text-muted-foreground">{r.backSize > 0 ? r.backSize.toFixed(0) : '-'}</div>
                <div className="col-span-2">
                  <button
                    onClick={() => r.layOdds > 0 && addToBetSlip({ marketId: match.gmid, runnerId, runnerName: r.name, eventName: match.eventName, type: 'lay', odds: r.layOdds })}
                    disabled={r.layOdds === 0}
                    className={`btn-lay w-full py-2 ${r.layOdds === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="odds-text">{r.layOdds > 0 ? r.layOdds.toFixed(2) : '-'}</span>
                  </button>
                </div>
                <div className="col-span-2 text-center text-[9px] text-muted-foreground">{r.laySize > 0 ? r.laySize.toFixed(0) : '-'}</div>
              </div>

              {slip && (
                <div className={`m-2 p-3 rounded border-l-4 shadow-2xl ${slip.type === 'back' ? 'bg-[#e2f2ff] border-[#2b92e4]' : 'bg-[#fff0f3] border-[#ef6e8b]'}`}>
                  <div className="text-[10px] font-bold text-gray-700 mb-1">{slip.type.toUpperCase()} @ {slip.odds}</div>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-gray-600 block uppercase mb-1">Stake</label>
                      <input type="number" className="w-full p-2 rounded bg-white text-black font-bold outline-none border border-gray-300" placeholder="Amount" value={slip.stake || ''} onChange={(e) => updateBetSlipStake(runnerId, Number(e.target.value))} />
                    </div>
                    <Button onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 h-10 px-6 font-black rounded-sm shadow-md">PLACE BET</Button>
                    <Button variant="ghost" onClick={() => updateBetSlipStake(runnerId, 0)} className="h-10 text-gray-500 font-bold">✕</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
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

  const fetchLiveMatches = useCallback(async () => {
    setFetchingLive(true);
    try {
      const sports = sportFilter === 'all' ? ['cricket', 'football', 'tennis'] : [sportFilter];
      const all: MatchItem[] = [];
      for (const sport of sports) {
        try {
          const data = await sportsDataService.getMatches(sport);
          all.push(...parseBetnexMatches(data, sport));
        } catch { /* skip */ }
      }
      setLiveMatches(all);
    } catch { /* ignore */ } finally {
      setFetchingLive(false);
    }
  }, [sportFilter]);

  useEffect(() => {
    fetchLiveMatches();
  }, [fetchLiveMatches]);

  const liveNow = useMemo(() => liveMatches.filter(m => m.isLive), [liveMatches]);
  const upcoming = useMemo(() => liveMatches.filter(m => !m.isLive), [liveMatches]);

  // Fallback DB markets
  const filtered = useMemo(() => sportFilter === 'all' ? markets : markets.filter(m => m.sport === sportFilter), [markets, sportFilter]);

  if (selectedMatch) {
    return (
      <div className="p-2 lg:p-4 max-w-6xl mx-auto">
        <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} betSlip={betSlip} addToBetSlip={addToBetSlip} updateBetSlipStake={updateBetSlipStake} placeBets={placeBets} />
      </div>
    );
  }

  return (
    <div className="p-2 lg:p-4 max-w-6xl mx-auto space-y-4">
      {/* Sport Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'cricket', 'football', 'tennis'].map(s => (
          <button key={s} onClick={() => setSportFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${sportFilter === s ? 'bg-yellow-600 text-white' : 'bg-[#1e273e] text-gray-400 hover:text-white'}`}>
            {s === 'all' ? '🔥 All' : `${sportIcon[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
        <button onClick={() => { refreshData(); fetchLiveMatches(); }} className="ml-auto p-2 text-muted-foreground hover:text-yellow-500">
          <RefreshCw className={`w-4 h-4 ${fetchingLive ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {fetchingLive && liveMatches.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-3" />
          Loading matches...
        </div>
      )}

      {/* Live Matches */}
      {liveNow.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE MATCHES ({liveNow.length})
          </div>
          <div className="space-y-2">
            {liveNow.map(m => (
              <button key={m.gmid} onClick={() => setSelectedMatch(m)} className="w-full bg-[#161d2f] rounded-lg border border-white/5 hover:border-yellow-500/30 transition-colors p-3 text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sportIcon[m.sport] || '🏆'}</span>
                    <div>
                      <span className="font-black text-sm uppercase text-foreground">{m.eventName}</span>
                      <p className="text-[10px] text-muted-foreground">{m.competition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Inline odds preview */}
                    {m.runners.length >= 2 && (
                      <div className="hidden sm:flex gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-[#72bbef]/20 text-[#72bbef] font-bold">{m.runners[0].name.slice(0, 8)} {m.runners[0].backOdds.toFixed(2)}</span>
                        <span className="px-2 py-0.5 rounded bg-[#faa9ba]/20 text-[#faa9ba] font-bold">{m.runners[1].name.slice(0, 8)} {m.runners[1].backOdds.toFixed(2)}</span>
                      </div>
                    )}
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

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-500 mt-4">
            🕐 UPCOMING ({upcoming.length})
          </div>
          <div className="space-y-2">
            {upcoming.map(m => (
              <button key={m.gmid} onClick={() => setSelectedMatch(m)} className="w-full bg-[#161d2f] rounded-lg border border-white/5 hover:border-yellow-500/30 transition-colors p-3 text-left">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{sportIcon[m.sport] || '🏆'}</span>
                    <div>
                      <span className="font-black text-sm uppercase text-foreground">{m.eventName}</span>
                      <p className="text-[10px] text-muted-foreground">{m.competition}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-yellow-500 font-bold">
                      {new Date(m.startTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(m.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {!fetchingLive && liveMatches.length === 0 && filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No matches available right now.</p>
        </div>
      )}
    </div>
  );
};

export default ExchangePage;
