import { Market } from '@/types/exchange';
import { useApp } from '@/context/AppContext';
import { Clock, TrendingUp } from 'lucide-react';

const sportEmoji: Record<string, string> = { cricket: '🏏', football: '⚽', tennis: '🎾' };

const OddsGrid = ({ market }: { market: Market }) => {
  const { addToBetSlip } = useApp();

  const handleClick = (runnerId: string, runnerName: string, type: 'back' | 'lay', odds: number) => {
    addToBetSlip({
      marketId: market.id,
      runnerId,
      runnerName,
      eventName: market.event,
      type,
      odds,
    });
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
      <div className="grid grid-cols-[1fr_repeat(6,60px)] gap-1 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <div className="text-muted-foreground">Runner</div>
        <div className="text-center text-back-lighter">Back</div>
        <div className="text-center text-back-lighter">Back</div>
        <div className="text-center text-back">Back</div>
        <div className="text-center text-lay">Lay</div>
        <div className="text-center text-lay-lighter">Lay</div>
        <div className="text-center text-lay-lighter">Lay</div>
      </div>

      {/* Runners */}
      {market.runners.map((runner) => (
        <div key={runner.id} className="grid grid-cols-[1fr_repeat(6,60px)] gap-1 px-4 py-1.5 border-t border-border/50 hover:bg-surface-2/50 transition-colors">
          <div className="flex items-center text-sm font-medium text-foreground">
            {runner.name}
          </div>

          {/* Back odds - 3rd, 2nd, best */}
          <button
            onClick={() => handleClick(runner.id, runner.name, 'back', runner.backOdds[2])}
            className="odds-cell-back-light"
          >
            <div>{runner.backOdds[2]}</div>
            <div className="text-[9px] opacity-70">{(runner.backSizes[2] / 1000).toFixed(0)}K</div>
          </button>
          <button
            onClick={() => handleClick(runner.id, runner.name, 'back', runner.backOdds[1])}
            className="odds-cell-back-light"
          >
            <div>{runner.backOdds[1]}</div>
            <div className="text-[9px] opacity-70">{(runner.backSizes[1] / 1000).toFixed(0)}K</div>
          </button>
          <button
            onClick={() => handleClick(runner.id, runner.name, 'back', runner.backOdds[0])}
            className="odds-cell-back"
          >
            <div>{runner.backOdds[0]}</div>
            <div className="text-[9px] opacity-80">{(runner.backSizes[0] / 1000).toFixed(0)}K</div>
          </button>

          {/* Lay odds - best, 2nd, 3rd */}
          <button
            onClick={() => handleClick(runner.id, runner.name, 'lay', runner.layOdds[0])}
            className="odds-cell-lay"
          >
            <div>{runner.layOdds[0]}</div>
            <div className="text-[9px] opacity-80">{(runner.laySizes[0] / 1000).toFixed(0)}K</div>
          </button>
          <button
            onClick={() => handleClick(runner.id, runner.name, 'lay', runner.layOdds[1])}
            className="odds-cell-lay-light"
          >
            <div>{runner.layOdds[1]}</div>
            <div className="text-[9px] opacity-70">{(runner.laySizes[1] / 1000).toFixed(0)}K</div>
          </button>
          <button
            onClick={() => handleClick(runner.id, runner.name, 'lay', runner.layOdds[2])}
            className="odds-cell-lay-light"
          >
            <div>{runner.layOdds[2]}</div>
            <div className="text-[9px] opacity-70">{(runner.laySizes[2] / 1000).toFixed(0)}K</div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default OddsGrid;
