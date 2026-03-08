import { useState, useEffect, useCallback } from 'react';
import { casinoApiService } from '@/services/casinoApiService';
import { ArrowLeft, RefreshCw, Tv, Search, X, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

interface CasinoGame {
  gameId: string;
  gameName?: string;
  name?: string;
  provider?: string;
  type?: string;
  image?: string;
  img?: string;
  thumbnail?: string;
  [key: string]: any;
}

const LiveCasinoPage = () => {
  const [games, setGames] = useState<CasinoGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<CasinoGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [providers, setProviders] = useState<string[]>([]);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [gameName, setGameName] = useState('');
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await casinoApiService.getGameList();
      const list = Array.isArray(res) ? res : (res?.data || res?.games || res?.result || []);
      const gameList = Array.isArray(list) ? list : Object.values(list).flat();
      setGames(gameList as CasinoGame[]);

      // Extract unique providers
      const providerSet = new Set<string>();
      (gameList as CasinoGame[]).forEach(g => {
        if (g.provider) providerSet.add(g.provider);
      });
      setProviders(Array.from(providerSet).sort());
    } catch (err: any) {
      console.error('Failed to fetch games:', err);
      toast.error('Games load nahi ho paye');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGames(); }, [fetchGames]);

  useEffect(() => {
    let filtered = games;
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(g => g.provider === selectedProvider);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(g =>
        (g.gameName || g.name || '').toLowerCase().includes(q) ||
        (g.provider || '').toLowerCase().includes(q)
      );
    }
    setFilteredGames(filtered);
  }, [games, search, selectedProvider]);

  const launchGame = async (game: CasinoGame) => {
    const id = game.gameId || game.id;
    if (!id) { toast.error('Game ID not found'); return; }
    setLaunchingId(id);
    try {
      const res = await casinoApiService.getGameUrl(id);
      const url = res?.payload?.game_launch_url || res?.url || res?.game_url || res?.launch_url || res?.data?.url;
      if (!url) {
        console.error('Game URL response:', res);
        toast.error('Game URL nahi mila');
        return;
      }
      setGameUrl(url);
      setGameName(res?.payload?.game_name || game.gameName || game.name || 'Game');
    } catch (err: any) {
      console.error('Failed to launch game:', err);
      toast.error('Game launch nahi ho paya');
    } finally {
      setLaunchingId(null);
    }
  };

  const getGameImage = (g: CasinoGame) => g.image || g.img || g.thumbnail || '';
  const getGameName = (g: CasinoGame) => g.gameName || g.name || `Game ${g.gameId}`;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Tv className="w-5 h-5 text-primary" /> Live Casino
          </h2>
          <button onClick={fetchGames} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Play live casino games from Evolution, Jili & 50+ providers.</p>

        {/* Search & Filter */}
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
            value={selectedProvider}
            onChange={e => setSelectedProvider(e.target.value)}
            className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Providers</option>
            {providers.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{games.length === 0 ? 'No games available' : 'No games match your search'}</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-3">{filteredGames.length} games found</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map((game, i) => {
                const img = getGameImage(game);
                const name = getGameName(game);
                const id = game.gameId || game.id || String(i);
                const isLaunching = launchingId === id;
                return (
                  <button
                    key={id}
                    onClick={() => launchGame(game)}
                    disabled={isLaunching}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all text-left"
                  >
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {img ? (
                        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {isLaunching && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-bold text-primary">▶ PLAY</span>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-foreground truncate">{name}</p>
                      {game.provider && (
                        <p className="text-[10px] text-muted-foreground truncate">{game.provider}</p>
                      )}
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
