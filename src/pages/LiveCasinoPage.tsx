import { useState, useMemo } from 'react';
import { casinoApiService } from '@/services/casinoApiService';
import { CASINO_GAMES, GAME_PROVIDERS, GAME_TYPES, type CasinoGame } from '@/data/casinoGames';
import { ArrowLeft, RefreshCw, Tv, Search, X, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

const LiveCasinoPage = () => {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [gameName, setGameName] = useState('');
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const filteredGames = useMemo(() => {
    let filtered = CASINO_GAMES;
    if (selectedProvider !== 'all') filtered = filtered.filter(g => g.provider === selectedProvider);
    if (selectedType !== 'all') filtered = filtered.filter(g => g.type === selectedType);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(g => g.name.toLowerCase().includes(q) || g.provider.toLowerCase().includes(q));
    }
    return filtered;
  }, [search, selectedProvider, selectedType]);

  const launchGame = async (game: CasinoGame) => {
    setLaunchingId(game.gameId);
    try {
      const res = await casinoApiService.getGameUrl(game.gameId);
      const url = res?.payload?.game_launch_url || res?.url || res?.game_url;
      if (!url) {
        console.error('Game URL response:', res);
        toast.error('Game launch nahi ho paya');
        return;
      }
      setGameUrl(url);
      setGameName(res?.payload?.game_name || game.name);
    } catch (err: any) {
      console.error('Failed to launch game:', err);
      toast.error('Game launch failed');
    } finally {
      setLaunchingId(null);
    }
  };

  // Game iframe view
  if (gameUrl) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
          <button onClick={() => setGameUrl(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className="text-sm font-bold text-foreground truncate mx-4">{gameName}</span>
          <button onClick={() => setGameUrl(null)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <iframe
          src={gameUrl}
          className="flex-1 w-full border-0"
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
        />
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
        <p className="text-sm text-muted-foreground mb-4">Play live casino, slots & table games from top providers.</p>

        {/* Filters */}
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
          <select
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground"
          >
            <option value="all">All Providers</option>
            {GAME_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Games */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No games match your search</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">{filteredGames.length} games</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map(game => {
                const isLaunching = launchingId === game.gameId;
                return (
                  <button
                    key={game.gameId}
                    onClick={() => launchGame(game)}
                    disabled={isLaunching}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all text-left"
                  >
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      {isLaunching && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-bold text-primary">▶ PLAY</span>
                      </div>
                      <span className="absolute top-1.5 right-1.5 text-[9px] uppercase bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                        {game.type}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-foreground truncate">{game.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{game.provider}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveCasinoPage;
