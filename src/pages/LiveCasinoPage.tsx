import { useState, useMemo, useEffect, useRef } from 'react';
import { CASINO_GAMES, GAME_TYPES, type CasinoGame } from '@/data/casinoGames';
import { Search, Gamepad2, Tv, X, Maximize2, Minimize2, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { casinoApiService } from '@/services/casinoApiService';

interface GameSub {
  sid: number;
  nat: string;
  b?: number;
  bs?: number;
  l?: number;
  ls?: number;
  sr: number;
  gstatus: string;
  min?: number;
  max?: number;
  subtype?: string;
  etype?: string;
}

interface GameData {
  mid?: number;
  gtype?: string;
  sub?: GameSub[];
  card?: string;
  lt?: number;
  ft?: number;
  remark?: string;
}

const LiveCasinoPage = () => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [diamondGame, setDiamondGame] = useState<{ gameId: string; name: string; data: GameData } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [launching, setLaunching] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      const tableData = await casinoApiService.getDiamondTableData(game.gameId);
      if (tableData?.success && tableData?.data) {
        setDiamondGame({ gameId: game.gameId, name: game.name, data: tableData.data });
        setIsFullscreen(false);
        toast.success(`${game.name} launched!`);
      } else {
        toast.error(tableData?.message || 'Game data not available.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to launch game');
    } finally {
      setLaunching(false);
    }
  };

  // Poll live data every 3 seconds when game is open
  useEffect(() => {
    if (!diamondGame) return;
    const poll = async () => {
      try {
        const res = await casinoApiService.getDiamondTableData(diamondGame.gameId);
        if (res?.success && res?.data) {
          setDiamondGame(prev => prev ? { ...prev, data: res.data } : null);
        }
      } catch { /* ignore poll errors */ }
    };
    pollRef.current = setInterval(poll, 3000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [diamondGame?.gameId]);

  const closeGame = () => {
    setDiamondGame(null);
    setIsFullscreen(false);
    if (pollRef.current) clearInterval(pollRef.current);
  };

  if (diamondGame) {
    const { data, name } = diamondGame;
    const subs = data?.sub || [];
    const statusOpen = subs.some(s => s.gstatus === 'OPEN');

    return (
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'flex-1'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">{name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${statusOpen ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-destructive/20 text-destructive'}`}>
              {statusOpen ? 'LIVE' : 'SUSPENDED'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={closeGame} className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Info Bar */}
        <div className="px-4 py-2 bg-card/50 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>Round: {data?.mid || '—'}</span>
          <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Auto-updating</span>
        </div>

        {/* Live Betting Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-lg mx-auto space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-muted-foreground uppercase px-2">
              <span>Selection</span>
              <span className="text-center text-blue-400">Back</span>
              <span className="text-center text-pink-400">Lay</span>
            </div>

            {subs.map((sub) => (
              <div key={sub.sid} className={`grid grid-cols-3 gap-2 items-center p-3 rounded-xl border transition-all ${
                sub.gstatus === 'OPEN' ? 'bg-card border-border' : 'bg-muted/30 border-border/50 opacity-60'
              }`}>
                {/* Selection Name */}
                <div>
                  <p className="text-sm font-bold text-foreground">{sub.nat}</p>
                  <p className="text-[10px] text-muted-foreground">{sub.subtype || sub.etype}</p>
                </div>

                {/* Back */}
                <button
                  disabled={sub.gstatus !== 'OPEN'}
                  className="flex flex-col items-center py-2 px-3 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-bold text-blue-400">{sub.b?.toFixed(2) || '—'}</span>
                  <span className="text-[9px] text-blue-400/70">{sub.bs ? (sub.bs / 1000).toFixed(0) + 'K' : ''}</span>
                </button>

                {/* Lay */}
                <button
                  disabled={sub.gstatus !== 'OPEN'}
                  className="flex flex-col items-center py-2 px-3 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="text-sm font-bold text-pink-400">{sub.l?.toFixed(2) || '—'}</span>
                  <span className="text-[9px] text-pink-400/70">{sub.ls ? (sub.ls / 1000).toFixed(0) + 'K' : ''}</span>
                </button>
              </div>
            ))}

            {subs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Loading game data...</p>
              </div>
            )}

            {/* Min/Max info */}
            {subs[0]?.min && (
              <div className="text-center text-[10px] text-muted-foreground pt-2">
                Min: ₹{subs[0].min?.toLocaleString()} | Max: ₹{subs[0].max?.toLocaleString()}
              </div>
            )}
          </div>
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