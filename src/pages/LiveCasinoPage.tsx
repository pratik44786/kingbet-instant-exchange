import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { casinoApiService } from '@/services/casinoApiService';
import { CASINO_GAMES, GAME_PROVIDERS, GAME_TYPES, type CasinoGame } from '@/data/casinoGames';
import { Search, Gamepad2, X, Maximize2, Minimize2, Tv, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LiveCasinoPage = () => {
  const [search, setSearch] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [gameName, setGameName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingGame, setIsLoadingGame] = useState(false);

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
      // Step 1: Get game launch URL from casino API
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

      // Step 2: Proxy the game URL through our edge function to bypass X-Frame-Options
      setGameName(res?.payload?.game_name || game.name);
      setIsLoadingGame(true);
      setGameHtml(null);
      setIsFullscreen(false);

      const { data: proxyData, error: proxyError } = await supabase.functions.invoke('game-proxy', {
        body: { url },
      });

      if (proxyError) {
        console.error('Proxy error:', proxyError);
        // Fallback: try opening in new tab
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.info('Game opened in new tab (iframe blocked)');
        setIsLoadingGame(false);
        return;
      }

      // proxyData could be HTML string or JSON
      if (typeof proxyData === 'string') {
        setGameHtml(proxyData);
      } else if (proxyData?.error) {
        toast.error(proxyData.error);
        window.open(url, '_blank', 'noopener,noreferrer');
        setIsLoadingGame(false);
        return;
      } else {
        // Unexpected response - fallback
        console.error('Unexpected proxy response:', proxyData);
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.info('Game opened in new tab');
        setIsLoadingGame(false);
        return;
      }

      setIsLoadingGame(false);
      toast.success(`${res?.payload?.game_name || game.name} launched!`);
    } catch (err: any) {
      console.error('Failed to launch game:', err);
      toast.error('Game launch failed');
      setIsLoadingGame(false);
    } finally {
      setLaunchingId(null);
    }
  };

  const closeGame = () => {
    setGameHtml(null);
    setGameName('');
    setIsFullscreen(false);
    setIsLoadingGame(false);
  };

  // Game view (srcdoc iframe)
  if (gameHtml || isLoadingGame) {
    return (
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'flex-1'}`}>
        {/* Game header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{gameName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={closeGame}
              className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Game content */}
        <div className="flex-1 relative bg-black min-h-[400px]">
          {isLoadingGame && !gameHtml ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading {gameName}...</p>
              </div>
            </div>
          ) : gameHtml ? (
            <iframe
              srcDoc={gameHtml}
              className="absolute inset-0 w-full h-full border-0"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation"
              allowFullScreen
            />
          ) : null}
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
                        <span className="text-xs font-bold text-primary flex items-center gap-1">▶ PLAY</span>
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
