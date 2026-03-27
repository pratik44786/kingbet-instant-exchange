import { useState, useMemo } from 'react';
import { CASINO_GAMES, GAME_TYPES, type CasinoGame } from '@/data/casinoGames';
import { Search, Gamepad2, Tv, X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { casinoApiService } from '@/services/casinoApiService';

const LiveCasinoPage = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [diamondGame, setDiamondGame] = useState<{ url: string; name: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [launching, setLaunching] = useState(false);

  const filteredGames = useMemo(() => {
    let filtered = CASINO_GAMES;
    if (selectedType !== 'all') filtered = filtered.filter(g => g.type === selectedType);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, selectedType]);

  const launchGame = async (game: CasinoGame) => {
    setLaunching(true);
    try {
      // Fetch live table data from Diamond Casino API
      const tableData = await casinoApiService.getDiamondTableData(game.gameId);
      console.log('Diamond table data:', tableData);
      
      if (tableData?.success && tableData?.data) {
        // Game data received — open in embedded view
        // The Diamond Casino API returns betting data, not an iframe URL
        // We'll render it within our own UI
        setDiamondGame({ url: game.gameId, name: game.name, data: tableData.data });
        setIsFullscreen(false);
        toast.success(`${game.name} launched!`);
      } else {
        console.error('Table data response:', tableData);
        toast.error(tableData?.message || 'Game data not available. Try again.');
      }
    } catch (err: any) {
      console.error('Game launch error:', err);
      toast.error(err.message || 'Failed to launch game');
    } finally {
      setLaunching(false);
    }
  };

  if (diamondGame) {
    return (
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'flex-1'}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{diamondGame.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 text-destructive font-semibold animate-pulse">LIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setDiamondGame(null); setIsFullscreen(false); }}
              className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 relative bg-black min-h-[500px]">
          <iframe
            src={diamondGame.url}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> Live Casino
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {CASINO_GAMES.length} live table games — Diamond Casino
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
          >
            <option value="all">All Types</option>
            {GAME_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No games match your search</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">{filteredGames.length} games</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map(game => (
                <button
                  key={game.gameId}
                  onClick={() => launchGame(game)}
                  disabled={launching}
                  className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all text-left disabled:opacity-50"
                >
                  <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-xs font-bold text-primary">▶ PLAY</span>
                    </div>
                    <span className="absolute top-1.5 right-1.5 text-[9px] uppercase bg-destructive/90 text-destructive-foreground px-1.5 py-0.5 rounded font-bold animate-pulse">
                      LIVE
                    </span>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-foreground truncate">{game.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">Diamond Casino</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveCasinoPage;
