import OddsGrid from '@/components/OddsGrid';
import BetSlip from '@/components/BetSlip';
import { useApp } from '@/context/AppContext';

const ExchangePage = ({ sportFilter }: { sportFilter?: string }) => {
  const { markets, bets } = useApp();
  const filtered = sportFilter ? markets.filter(m => m.sport === sportFilter) : markets;

  return (
    <div className="flex-1 flex gap-4 p-4 overflow-auto">
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {sportFilter ? sportFilter.charAt(0).toUpperCase() + sportFilter.slice(1) + ' Markets' : 'All Markets'}
          </h2>
          <span className="text-xs text-muted-foreground">{filtered.length} markets • Live odds</span>
        </div>
        {filtered.length === 0 ? (
          <div className="surface-card rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No markets available</p>
          </div>
        ) : (
          filtered.map(market => <OddsGrid key={market.id} market={market} />)
        )}

        {/* Recent bets */}
        {bets.length > 0 && (
          <div className="surface-card rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Recent Bets</h3>
            </div>
            <div className="divide-y divide-border/50">
              {bets.slice(0, 5).map(bet => (
                <div key={bet.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${bet.type === 'back' ? 'bg-back text-back-foreground' : 'bg-lay text-lay-foreground'}`}>
                      {bet.type}
                    </span>
                    <span className="text-foreground font-medium">{bet.runnerName}</span>
                    <span className="text-muted-foreground">@ {bet.odds}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-foreground">{bet.stake} PTS</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${bet.status === 'matched' ? 'bg-positive/20 text-positive' : 'bg-primary/20 text-primary'}`}>
                      {bet.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bet Slip Sidebar */}
      <div className="w-72 flex-shrink-0 hidden md:block space-y-4">
        <BetSlip />
      </div>
    </div>
  );
};

export default ExchangePage;
