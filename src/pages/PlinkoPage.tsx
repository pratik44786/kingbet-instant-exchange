import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const MULTIPLIERS = [0.5, 1, 0.5, 2, 1, 5, 1, 2, 0.5, 10, 0.5, 2, 1, 5, 1, 2, 0.5, 1, 0.5];

const PlinkoPage = () => {
  const { currentUser, addPoints, removePoints } = useApp();
  const [stake, setStake] = useState(50);
  const [result, setResult] = useState<{ multiplier: number; winnings: number } | null>(null);
  const [dropping, setDropping] = useState(false);
  const [history, setHistory] = useState<{ mult: number; win: number }[]>([]);

  const drop = () => {
    if (stake <= 0 || stake > currentUser.balance || dropping) return;
    removePoints(currentUser.id, stake);
    setDropping(true);
    setResult(null);

    setTimeout(() => {
      const idx = Math.floor(Math.random() * MULTIPLIERS.length);
      const mult = MULTIPLIERS[idx];
      const winnings = Math.floor(stake * mult);
      if (winnings > 0) addPoints(currentUser.id, winnings);
      setResult({ multiplier: mult, winnings });
      setHistory(prev => [{ mult, win: winnings }, ...prev.slice(0, 19)]);
      setDropping(false);
    }, 1500);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <Link to="/casino" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </Link>
        <h2 className="text-lg font-bold text-foreground mb-4">🎯 Plinko</h2>

        {/* Multiplier slots */}
        <div className="surface-card rounded-xl p-6 mb-4">
          <div className="flex flex-wrap gap-1 justify-center mb-6">
            {MULTIPLIERS.map((m, i) => (
              <div key={i} className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold font-mono
                ${m >= 5 ? 'bg-primary/30 text-primary' : m >= 2 ? 'bg-positive/20 text-positive' : m >= 1 ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/20 text-destructive'}`}>
                {m}x
              </div>
            ))}
          </div>

          {dropping && (
            <div className="text-center py-4">
              <div className="text-4xl animate-bounce">🎯</div>
              <p className="text-sm text-muted-foreground mt-2">Ball dropping...</p>
            </div>
          )}

          {result && !dropping && (
            <div className="text-center py-4">
              <p className={`text-4xl font-black font-mono ${result.multiplier >= 2 ? 'text-positive' : result.multiplier >= 1 ? 'text-foreground' : 'text-destructive'}`}>
                {result.multiplier}x
              </p>
              <p className={`text-sm font-semibold mt-1 ${result.winnings >= stake ? 'text-positive' : 'text-destructive'}`}>
                {result.winnings >= stake ? `Won ${result.winnings} PTS` : `Lost ${stake - result.winnings} PTS`}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="surface-card rounded-lg p-4 mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground uppercase block mb-1">Stake (PTS)</label>
              <input type="number" value={stake || ''} onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={drop} disabled={dropping || stake <= 0 || stake > currentUser.balance}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
              Drop Ball
            </button>
          </div>
        </div>

        {/* History */}
        <div className="flex flex-wrap gap-2">
          {history.map((h, i) => (
            <span key={i} className={`text-xs font-mono font-bold px-2 py-1 rounded ${h.mult >= 2 ? 'bg-positive/20 text-positive' : h.mult >= 1 ? 'bg-secondary text-secondary-foreground' : 'bg-destructive/20 text-destructive'}`}>
              {h.mult}x
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlinkoPage;
