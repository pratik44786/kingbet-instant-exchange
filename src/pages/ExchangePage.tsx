import React, { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MarketData, RunnerData } from '@/hooks/useMarkets';
import type { BetSlipItem } from '@/types/exchange';

const sportIcon: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };

// Generate deterministic secondary markets per sport
function generateSecondaryMarkets(market: MarketData) {
  const teams = market.event_name.split(' vs ');
  const seed = market.id.charCodeAt(0) + market.id.charCodeAt(5);
  const t1 = teams[0] || 'Team A';
  const t2 = teams[1] || 'Team B';

  if (market.sport === 'cricket') {
    return {
      title: 'FANCY', icon: '⭐', noLabel: 'NO', yesLabel: 'YES', isCricket: true,
      items: [
        { label: `${t1} 1st Inn Runs`, no: 165 + (seed % 30), yes: 165 + (seed % 30) - 2 },
        { label: `${t2} 1st Inn Runs`, no: 155 + (seed % 25), yes: 155 + (seed % 25) - 3 },
        { label: `${t1} 1st 6 Ovr Runs`, no: 42 + (seed % 10), yes: 42 + (seed % 10) - 1 },
        { label: `${t2} 1st 6 Ovr Runs`, no: 38 + (seed % 12), yes: 38 + (seed % 12) - 2 },
        { label: `Total Match Fours`, no: 28 + (seed % 8), yes: 28 + (seed % 8) - 1 },
        { label: `Total Match Sixes`, no: 12 + (seed % 6), yes: 12 + (seed % 6) - 1 },
        { label: `${t1} Wkts`, no: 5 + (seed % 4), yes: 5 + (seed % 4) - 1 },
        { label: `1st Wkt Pship Runs`, no: 22 + (seed % 15), yes: 22 + (seed % 15) - 2 },
      ],
    };
  }

  if (market.sport === 'football') {
    return {
      title: 'GOALS & SPECIALS', icon: '🎯', noLabel: 'UNDER', yesLabel: 'OVER', isCricket: false,
      items: [
        { label: `Total Goals O/U 2.5`, no: 1.85 + (seed % 10) * 0.02, yes: 1.95 + (seed % 10) * 0.02 },
        { label: `Both Teams To Score`, no: 1.70 + (seed % 8) * 0.03, yes: 2.10 + (seed % 8) * 0.03 },
        { label: `${t1} Goals O/U 1.5`, no: 1.90 + (seed % 6) * 0.02, yes: 1.90 + (seed % 6) * 0.02 },
        { label: `${t2} Goals O/U 1.5`, no: 2.05 + (seed % 7) * 0.02, yes: 1.75 + (seed % 7) * 0.02 },
        { label: `Total Corners O/U 9.5`, no: 1.80 + (seed % 5) * 0.03, yes: 2.00 + (seed % 5) * 0.03 },
        { label: `1st Half Goals O/U 1.5`, no: 2.20 + (seed % 9) * 0.02, yes: 1.60 + (seed % 9) * 0.02 },
        { label: `${t1} Clean Sheet`, no: 2.50 + (seed % 10) * 0.05, yes: 1.50 + (seed % 10) * 0.05 },
        { label: `Total Cards O/U 3.5`, no: 1.75 + (seed % 6) * 0.03, yes: 2.05 + (seed % 6) * 0.03 },
      ],
    };
  }

  return {
    title: 'SET & GAME MARKETS', icon: '🎾', noLabel: 'UNDER', yesLabel: 'OVER', isCricket: false,
    items: [
      { label: `Total Sets O/U 2.5`, no: 1.80 + (seed % 8) * 0.03, yes: 2.00 + (seed % 8) * 0.03 },
      { label: `${t1} Win 1st Set`, no: 2.10 + (seed % 10) * 0.04, yes: 1.70 + (seed % 10) * 0.04 },
      { label: `Total Games O/U 22.5`, no: 1.85 + (seed % 7) * 0.02, yes: 1.95 + (seed % 7) * 0.02 },
      { label: `${t2} Win 1st Set`, no: 1.70 + (seed % 9) * 0.04, yes: 2.10 + (seed % 9) * 0.04 },
      { label: `1st Set Tiebreak`, no: 3.00 + (seed % 6) * 0.1, yes: 1.33 + (seed % 6) * 0.05 },
      { label: `${t1} Aces O/U 5.5`, no: 1.90 + (seed % 5) * 0.03, yes: 1.90 + (seed % 5) * 0.03 },
    ],
  };
}

// ═══ Memoized Secondary Markets ═══
const SecondaryMarketsSection = memo<{
  market: MarketData;
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => Promise<void>;
}>(({ market, betSlip, addToBetSlip, updateBetSlipStake, placeBets }) => {
  const data = useMemo(() => generateSecondaryMarkets(market), [market.id, market.sport, market.event_name]);

  const getBetType = (isYes: boolean): BetSlipItem['type'] => {
    if (data.isCricket) return isYes ? 'fancy_yes' : 'fancy_no';
    return isYes ? 'session_over' : 'session_under';
  };

  const getFakeRunnerId = (idx: number) => `${market.id}-secondary-${idx}`;

  return (
    <div className="mt-1">
      <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-gray-500 border-t border-yellow-500/20">
        <div className="col-span-6 pl-2 flex items-center gap-1">
          <span className="text-yellow-500">{data.icon}</span> {data.title}
        </div>
        <div className="col-span-3 text-center text-[#faa9ba]">{data.noLabel}</div>
        <div className="col-span-3 text-center text-[#72bbef]">{data.yesLabel}</div>
      </div>

      {data.items.map((f, idx) => {
        const fakeId = getFakeRunnerId(idx);
        const slip = betSlip.find(b => b.runnerId === fakeId);
        const noOdds = data.isCricket ? f.no : Number(f.no.toFixed(2));
        const yesOdds = data.isCricket ? f.yes : Number(f.yes.toFixed(2));

        return (
          <div key={idx} className="border-b border-white/5">
            <div className="grid grid-cols-12 items-center p-1 gap-1 bg-[#161d2f]">
              <div className="col-span-6 pl-2 text-xs font-bold text-gray-200">{f.label}</div>
              <div className="col-span-3">
                <button
                  onClick={() => addToBetSlip({ marketId: market.id, runnerId: fakeId, runnerName: f.label, eventName: market.event_name, type: getBetType(false), odds: noOdds })}
                  className="btn-lay w-full py-2"
                >
                  <span className="odds-text">{data.isCricket ? f.no : f.no.toFixed(2)}</span>
                  <span className="block text-[8px] opacity-60">100</span>
                </button>
              </div>
              <div className="col-span-3">
                <button
                  onClick={() => addToBetSlip({ marketId: market.id, runnerId: fakeId, runnerName: f.label, eventName: market.event_name, type: getBetType(true), odds: yesOdds })}
                  className="btn-back w-full py-2"
                >
                  <span className="odds-text">{data.isCricket ? f.yes : f.yes.toFixed(2)}</span>
                  <span className="block text-[8px] opacity-60">100</span>
                </button>
              </div>
            </div>

            {slip && (
              <div className={`m-2 p-3 rounded border-l-4 shadow-2xl ${slip.type.includes('yes') || slip.type.includes('over') ? 'bg-[#e2f2ff] border-[#2b92e4]' : 'bg-[#fff0f3] border-[#ef6e8b]'}`}>
                <div className="text-[10px] font-bold text-gray-600 mb-1 uppercase">{slip.type.replace('_', ' ')} @ {slip.odds}</div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-600 block uppercase mb-1">Stake</label>
                    <input type="number" className="w-full p-2 rounded bg-white text-black font-bold outline-none border border-gray-300" placeholder="Amount" value={slip.stake || ''} onChange={(e) => updateBetSlipStake(fakeId, Number(e.target.value))} />
                  </div>
                  <Button onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 h-10 px-6 font-black rounded-sm shadow-md">PLACE BET</Button>
                  <Button variant="ghost" onClick={() => updateBetSlipStake(fakeId, 0)} className="h-10 text-gray-500 font-bold">CANCEL</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

SecondaryMarketsSection.displayName = 'SecondaryMarketsSection';

// ═══ Memoized Market Card ═══
const MarketCard = memo<{
  market: MarketData;
  isLive: boolean;
  betSlip: BetSlipItem[];
  addToBetSlip: (item: Omit<BetSlipItem, 'stake'>) => void;
  updateBetSlipStake: (runnerId: string, stake: number) => void;
  placeBets: () => Promise<void>;
}>(({ market, isLive, betSlip, addToBetSlip, updateBetSlipStake, placeBets }) => {
  // Only get slips relevant to this market for comparison
  const marketSlips = useMemo(() => betSlip.filter(b => b.marketId === market.id), [betSlip, market.id]);

  return (
    <div className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e273e] p-3 flex justify-between items-center border-b border-yellow-500/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">{sportIcon[market.sport] || '🏆'}</span>
          <div>
            <span className="font-black text-sm uppercase italic text-gray-200">{market.event_name}</span>
            <p className="text-[10px] text-gray-500">{market.competition}</p>
          </div>
        </div>
        {isLive ? (
          <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE
          </div>
        ) : (
          <div className="text-[10px] text-yellow-500 font-bold">
            🕐 {new Date(market.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {new Date(market.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-gray-500">
        <div className="col-span-6 pl-2">MATCH ODDS</div>
        <div className="col-span-3 text-center text-[#72bbef]">BACK</div>
        <div className="col-span-3 text-center text-[#faa9ba]">LAY</div>
      </div>

      {market.runners.length === 0 && (
        <div className="px-4 py-3 text-center text-xs text-gray-500">Odds coming soon...</div>
      )}

      {market.runners.map((runner) => {
        const slip = marketSlips.find(b => b.runnerId === runner.id);
        return (
          <div key={runner.id} className="border-b border-white/5 last:border-0">
            <div className="grid grid-cols-12 items-center p-1 gap-1 bg-[#161d2f]">
              <div className="col-span-6 pl-2 text-xs font-bold text-gray-200">{runner.name}</div>
              <div className="col-span-3">
                <button
                  onClick={() => isLive && addToBetSlip({ marketId: market.id, runnerId: runner.id, runnerName: runner.name, eventName: market.event_name, type: 'back', odds: runner.back_odds })}
                  disabled={!isLive}
                  className={`btn-back w-full py-2 ${!isLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="odds-text">{runner.back_odds.toFixed(2)}</span>
                </button>
              </div>
              <div className="col-span-3">
                <button
                  onClick={() => isLive && addToBetSlip({ marketId: market.id, runnerId: runner.id, runnerName: runner.name, eventName: market.event_name, type: 'lay', odds: runner.lay_odds })}
                  disabled={!isLive}
                  className={`btn-lay w-full py-2 ${!isLive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="odds-text">{runner.lay_odds.toFixed(2)}</span>
                </button>
              </div>
            </div>

            {slip && isLive && (
              <div className={`m-2 p-3 rounded border-l-4 shadow-2xl ${slip.type === 'back' ? 'bg-[#e2f2ff] border-[#2b92e4]' : 'bg-[#fff0f3] border-[#ef6e8b]'}`}>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className="text-[10px] font-black text-gray-600 block uppercase mb-1">Stake</label>
                    <input type="number" className="w-full p-2 rounded bg-white text-black font-bold outline-none border border-gray-300" placeholder="Amount" value={slip.stake || ''} onChange={(e) => updateBetSlipStake(runner.id, Number(e.target.value))} />
                  </div>
                  <Button onClick={placeBets} className="bg-yellow-600 hover:bg-yellow-700 h-10 px-6 font-black rounded-sm shadow-md">PLACE BET</Button>
                  <Button variant="ghost" onClick={() => updateBetSlipStake(runner.id, 0)} className="h-10 text-gray-500 font-bold">CANCEL</Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {isLive && (
        <SecondaryMarketsSection market={market} betSlip={marketSlips} addToBetSlip={addToBetSlip} updateBetSlipStake={updateBetSlipStake} placeBets={placeBets} />
      )}
    </div>
  );
});

MarketCard.displayName = 'MarketCard';

// ═══ Main Page ═══
const ExchangePage: React.FC = () => {
  const { markets, marketsLoading, addToBetSlip, betSlip, updateBetSlipStake, placeBets, refreshData } = useApp();
  const [sportFilter, setSportFilter] = useState<string>('all');

  const filtered = useMemo(() => sportFilter === 'all' ? markets : markets.filter(m => m.sport === sportFilter), [markets, sportFilter]);

  const now = useMemo(() => Date.now(), [markets]); // recalculate only when markets change
  const liveMarkets = useMemo(() => filtered.filter(m => new Date(m.start_time).getTime() <= now), [filtered, now]);
  const upcomingMarkets = useMemo(() => filtered.filter(m => new Date(m.start_time).getTime() > now), [filtered, now]);

  return (
    <div className="p-2 lg:p-4 max-w-6xl mx-auto space-y-4">
      {/* Sport Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'cricket', 'football', 'tennis'].map(s => (
          <button
            key={s}
            onClick={() => setSportFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              sportFilter === s
                ? 'bg-yellow-600 text-white'
                : 'bg-[#1e273e] text-gray-400 hover:text-white'
            }`}
          >
            {s === 'all' ? '🔥 All' : `${sportIcon[s] || ''} ${s.charAt(0).toUpperCase() + s.slice(1)}`}
          </button>
        ))}
        <button onClick={refreshData} className="ml-auto p-2 text-gray-500 hover:text-yellow-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {marketsLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500 mx-auto mb-3" />
          Loading markets...
        </div>
      )}

      {!marketsLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No markets available right now.</p>
          <p className="text-xs mt-1">Markets refresh automatically every 15 seconds.</p>
        </div>
      )}

      {/* Live Markets */}
      {liveMarkets.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE MATCHES ({liveMarkets.length})
          </div>
          {liveMarkets.map(m => (
            <MarketCard key={m.id} market={m} isLive betSlip={betSlip} addToBetSlip={addToBetSlip} updateBetSlipStake={updateBetSlipStake} placeBets={placeBets} />
          ))}
        </>
      )}

      {/* Upcoming Markets */}
      {upcomingMarkets.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-500 mt-4">
            🕐 UPCOMING MATCHES ({upcomingMarkets.length})
          </div>
          {upcomingMarkets.map(m => (
            <MarketCard key={m.id} market={m} isLive={false} betSlip={betSlip} addToBetSlip={addToBetSlip} updateBetSlipStake={updateBetSlipStake} placeBets={placeBets} />
          ))}
        </>
      )}
    </div>
  );
};

export default ExchangePage;
