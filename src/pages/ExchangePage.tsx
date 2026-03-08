import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MarketData, RunnerData } from '@/hooks/useMarkets';

const sportIcon: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };

const ExchangePage: React.FC = () => {
  const { markets, marketsLoading, addToBetSlip, betSlip, updateBetSlipStake, placeBets, refreshData } = useApp();
  const [sportFilter, setSportFilter] = useState<string>('all');

  const filtered = sportFilter === 'all' ? markets : markets.filter(m => m.sport === sportFilter);

  const now = new Date();
  const liveMarkets = filtered.filter(m => new Date(m.start_time) <= now);
  const upcomingMarkets = filtered.filter(m => new Date(m.start_time) > now);

  const renderMarketCard = (market: MarketData, isLive: boolean) => (
    <div key={market.id} className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">
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

      {/* Market Table */}
      <div className="grid grid-cols-12 bg-[#121a2d] py-2 px-1 text-[10px] font-bold text-gray-500">
        <div className="col-span-6 pl-2">MATCH ODDS</div>
        <div className="col-span-3 text-center text-[#72bbef]">BACK</div>
        <div className="col-span-3 text-center text-[#faa9ba]">LAY</div>
      </div>

      {market.runners.length === 0 && (
        <div className="px-4 py-3 text-center text-xs text-gray-500">Odds coming soon...</div>
      )}

      {market.runners.map((runner) => {
        const slip = betSlip.find(b => b.runnerId === runner.id);
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

            {/* Inline Slip */}
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

      {/* Fancy Markets - Cricket Only */}
      {market.sport === 'cricket' && isLive && (
        <FancySection market={market} />
      )}
    </div>
  );

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
          {liveMarkets.map(m => renderMarketCard(m, true))}
        </>
      )}

      {/* Upcoming Markets */}
      {upcomingMarkets.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm font-bold text-yellow-500 mt-4">
            🕐 UPCOMING MATCHES ({upcomingMarkets.length})
          </div>
          {upcomingMarkets.map(m => renderMarketCard(m, false))}
        </>
      )}
    </div>
  );
};

export default ExchangePage;
