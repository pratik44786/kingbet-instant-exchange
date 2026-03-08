import { useState, useMemo } from 'react';
import { casinoApiService } from '@/services/casinoApiService';
import { CASINO_GAMES, GAME_PROVIDERS, GAME_TYPES, type CasinoGame } from '@/data/casinoGames';
import { Search, Gamepad2, Tv, ExternalLink, X, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';

// Diamond Casino iframe base
const DIAMOND_IFRAME_BASE = 'https://diamondcasino.neogames.cloud';

const LiveCasinoPage = () => {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [launchingId, setLaunchingId] = useState<string | null>(null);

  // Diamond Casino iframe state
  const [diamondGame, setDiamondGame] = useState<{ url: string; name: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if (game.source === 'diamond') {
      // Diamond Casino - embed iframe (neogames.cloud allows iframe)
      const username = 'kb' + Math.random().toString(36).slice(2, 10);
      const url = `${DIAMOND_IFRAME_BASE}/?username=${username}`;
      setDiamondGame({ url, name: game.name });
      setIsFullscreen(false);
      toast.success(`${game.name} launched!`);
      return;
    }

    // SPRIBE / BetNex games - popup window
    setLaunchingId(game.gameId);
    try {
      const res = await casinoApiService.getGameUrl(game.gameId);
      if (res?.success === false) {
        toast.error(res?.message || 'Game launch failed');
        return;
      }
      const url = res?.payload?.game_launch_url || res?.url || res?.game_url;
      if (!url) {
        console.error('Game URL response:', res);
        toast.error('Game launch URL not found');
        return;
      }

      const name = res?.payload?.game_name || game.name;
      const width = Math.min(1200, window.screen.availWidth - 100);
      const height = Math.min(800, window.screen.availHeight - 100);
      const left = Math.round((window.screen.availWidth - width) / 2);
      const top = Math.round((window.screen.availHeight - height) / 2);

      const popup = window.open(
        url,
        `game_${game.gameId}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no,menubar=no,toolbar=no,location=no,status=no`
      );

      if (!popup) {
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.info('Game opened in new tab (popup blocked)');
        return;
      }

      toast.success(`${name} launched!`);
    } catch (err: any) {
      console.error('Failed to launch game:', err);
      toast.error('Game launch failed');
    } finally {
      setLaunchingId(null);
    }
  };

  // Diamond Casino iframe view
  if (diamondGame) {
    return (
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'flex-1'}`}>
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{diamondGame.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">LIVE</span>
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
          {CASINO_GAMES.length} games from {GAME_PROVIDERS.length} providers — Live tables, slots & instant games.
        </p>

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
                const isDiamond = game.source === 'diamond';
                return (
                  <button
                    key={`${game.source}-${game.gameId}`}
                    onClick={() => launchGame(game)}
                    disabled={isLaunching}
                    className="group relative bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all text-left"
                  >
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      <img
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {isLaunching && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1">
                          {isDiamond ? '▶' : <ExternalLink className="w-3 h-3" />} PLAY
                        </span>
                      </div>
                      <div className="absolute top-1.5 right-1.5 flex gap-1">
                        {isDiamond && (
                          <span className="text-[9px] uppercase bg-red-500/90 text-white px-1.5 py-0.5 rounded font-bold animate-pulse">
                            LIVE
                          </span>
                        )}
                        <span className="text-[9px] uppercase bg-primary/90 text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                          {game.type}
                        </span>
                      </div>
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
