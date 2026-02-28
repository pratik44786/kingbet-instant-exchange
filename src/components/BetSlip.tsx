import { useApp } from '@/context/AppContext';
import { X, Trash2 } from 'lucide-react';

const BetSlip = () => {
  const { betSlip, removeFromBetSlip, updateBetSlipStake, placeBets, clearBetSlip, currentUser } = useApp();

  const totalStake = betSlip.reduce((s, b) => s + b.stake, 0);
  const canPlace = totalStake > 0 && totalStake <= currentUser.balance;

  if (betSlip.length === 0) {
    return (
      <div className="surface-card rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Bet Slip</h3>
        <p className="text-xs text-muted-foreground text-center py-6">Click on any odds to add to bet slip</p>
      </div>
    );
  }

  return (
    <div className="surface-card rounded-lg overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Bet Slip ({betSlip.length})</h3>
        <button onClick={clearBetSlip} className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1">
          <Trash2 className="w-3 h-3" /> Clear
        </button>
      </div>

      <div className="divide-y divide-border/50">
        {betSlip.map(item => (
          <div key={`${item.runnerId}-${item.type}`} className="px-4 py-3">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${item.type === 'back' ? 'bg-back text-back-foreground' : 'bg-lay text-lay-foreground'}`}>
                  {item.type}
                </span>
                <p className="text-sm font-medium text-foreground mt-1">{item.runnerName}</p>
                <p className="text-xs text-muted-foreground">{item.eventName}</p>
              </div>
              <button onClick={() => removeFromBetSlip(item.runnerId)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase">Odds</label>
                <div className="font-mono text-sm font-semibold text-foreground bg-surface-2 rounded px-2 py-1.5 text-center">
                  {item.odds}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase">Stake</label>
                <input
                  type="number"
                  value={item.stake || ''}
                  onChange={(e) => updateBetSlipStake(item.runnerId, Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-full font-mono text-sm font-semibold bg-surface-2 text-foreground rounded px-2 py-1.5 text-center outline-none focus:ring-1 focus:ring-primary border-none"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted-foreground uppercase">Profit</label>
                <div className="font-mono text-sm font-semibold text-positive bg-surface-2 rounded px-2 py-1.5 text-center">
                  {item.stake > 0 ? (item.type === 'back' ? ((item.odds - 1) * item.stake).toFixed(0) : item.stake.toFixed(0)) : '—'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 bg-surface-2 border-t border-border">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Total Stake</span>
          <span className="font-mono font-semibold text-foreground">{totalStake.toLocaleString()} PTS</span>
        </div>
        <button
          onClick={placeBets}
          disabled={!canPlace}
          className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:opacity-90"
        >
          Place Bet{betSlip.length > 1 ? 's' : ''}
        </button>
        {totalStake > currentUser.balance && (
          <p className="text-xs text-destructive mt-1 text-center">Insufficient balance</p>
        )}
      </div>
    </div>
  );
};

export default BetSlip;
