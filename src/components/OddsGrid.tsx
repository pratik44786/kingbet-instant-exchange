import { useState } from 'react';
import { Market } from '@/types/exchange';
import { useApp } from '@/context/AppContext';
import { Clock, TrendingUp } from 'lucide-react';

const sportEmoji: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };

const OddsGrid = ({ market }: { market: Market }) => {
  const { addToBetSlip, betSlip, updateBetSlipStake, removeFromBetSlip, placeBets, currentUser } = useApp();
  const [expandedRunner, setExpandedRunner] = useState<string | null>(null);

  const handleClick = (runnerId: string, runnerName: string, type: 'back' | 'lay', odds: number) => {
    const existing = betSlip.find(b => b.runnerId === runnerId && b.type === type);
    if (existing) {
      setExpandedRunner(expandedRunner === `${runnerId}-${type}` ? null : `${runnerId}-${type}`);
      return;
    }
    addToBetSlip({ marketId: market.id, runnerId, runnerName, eventName: market.event, type, odds });
    setExpandedRunner(`${runnerId}-${type}`);
  };

  return (
    <div className="surface-card rounded-lg overflow-hidden animate-slide-up">
      {/* Market Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-lg">{sportEmoji[market.sport]}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{market.event}</h3>
            <p className="text-xs text-muted-foreground">{market.competition}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-positive">
            <TrendingUp className="w-3 h-3" />
            <span>LIVE</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{new Date(market.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[1fr_80px_80px] gap-1 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <div className="text-muted-foreground">Runner</div>
        <div className="text-center text-back">Back</div>
        <div className="text-center text-lay">Lay</div>
      </div>

      {/* Runners */}
      {market.runners.map((runner) => {
        const backSlipKey = `${runner.id}-back`;
        const laySlipKey = `${runner.id}-lay`;
        const backItem = betSlip.find(b => b.runnerId === runner.id && b.type === 'back');
        const layItem = betSlip.find(b => b.runnerId === runner.id && b.type === 'lay');
        const showBackSlip = expandedRunner === backSlipKey && backItem;
        const showLaySlip = expandedRunner === laySlipKey && layItem;

        return (
          <div key={runner.id}>
            <div className="grid grid-cols-[1fr_80px_80px] gap-1 px-4 py-1.5 border-t border-border/50 hover:bg-surface-2/50 transition-colors">
              <div className="flex items-center text-sm font-medium text-foreground">
                {runner.name}
              </div>
              <button
                onClick={() => handleClick(runner.id, runner.name, 'back', runner.backOdds[0])}
                className="odds-cell-back"
              >
                <div>{runner.backOdds[0]}</div>
                <div className="text-[9px] opacity-80">{(runner.backSizes[0] / 1000).toFixed(0)}K</div>
              </button>
              <button
                onClick={() => handleClick(runner.id, runner.name, 'lay', runner.layOdds[0])}
                className="odds-cell-lay"
              >
                <div>{runner.layOdds[0]}</div>
                <div className="text-[9px] opacity-80">{(runner.laySizes[0] / 1000).toFixed(0)}K</div>
              </button>
            </div>

            {/* Inline Bet Slip */}
            {(showBackSlip || showLaySlip) && (() => {
              const item = (showBackSlip ? backItem : layItem)!;
              const profit = item.stake > 0 ? (item.type === 'back' ? ((item.odds - 1) * item.stake).toFixed(0) : item.stake.toFixed(0)) : '—';
              return (
                <div className={`mx-4 mb-2 p-3 rounded-lg border animate-slide-up ${item.type === 'back' ? 'bg-back/10 border-back/30' : 'bg-lay/10 border-lay/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.type === 'back' ? 'bg-back text-back-foreground' : 'bg-lay text-lay-foreground'}`}>
                        {item.type}
                      </span>
                      <span className="text-sm font-medium text-foreground">{item.runnerName}</span>
                      <span className="text-xs text-muted-foreground">@ {item.odds}</span>
                    </div>
                    <button onClick={() => { removeFromBetSlip(item.runnerId); setExpandedRunner(null); }} className="text-xs text-muted-foreground hover:text-destructive">✕</button>
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase">Stake</label>
                      <input type="number" value={item.stake || ''} onChange={e => updateBetSlipStake(item.runnerId, Math.max(0, Number(e.target.value)))}
                        placeholder="0" className="w-full font-mono text-sm bg-surface-2 text-foreground rounded px-2 py-1.5 text-center outline-none focus:ring-1 focus:ring-primary border border-border" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground uppercase">Profit</label>
                      <div className="font-mono text-sm text-positive bg-surface-2 rounded px-2 py-1.5 text-center border border-border">{profit}</div>
                    </div>
                    <button onClick={() => { placeBets(); setExpandedRunner(null); }}
                      disabled={item.stake <= 0 || item.stake > currentUser.balance}
                      className="bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                      Place
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })}
    </div>
  );
};

export default OddsGrid;
