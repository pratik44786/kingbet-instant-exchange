import { useState, useMemo } from 'react';
import OddsGrid from '@/components/OddsGrid';
import { useApp } from '@/context/AppContext';
import { Search } from 'lucide-react';

const ExchangePage = ({ sportFilter }: { sportFilter?: string }) => {
  const { markets, bets } = useApp();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const filtered = useMemo(() => {
    let result = sportFilter ? markets.filter(m => m.sport === sportFilter) : markets;
    if (search) result = result.filter(m => m.event.toLowerCase().includes(search.toLowerCase()) || m.competition.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [markets, sportFilter, search]);

  const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {sportFilter ? sportFilter.charAt(0).toUpperCase() + sportFilter.slice(1) + ' Markets' : 'All Markets'}
            </h2>
            <span className="text-xs text-muted-foreground">{filtered.length} markets • Live odds</span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
              placeholder="Search markets..."
              className="bg-surface-2 text-foreground text-sm rounded-lg pl-9 pr-3 py-2 border border-border outline-none focus:ring-1 focus:ring-primary w-56" />
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="surface-card rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No markets found</p>
          </div>
        ) : (
          paged.map(market => <OddsGrid key={market.id} market={market} />)
        )}

        {paged.length < filtered.length && (
          <button onClick={() => setPage(p => p + 1)}
            className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-3 transition-colors">
            Load More ({filtered.length - paged.length} remaining)
          </button>
        )}

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
    </div>
  );
};

export default ExchangePage;
