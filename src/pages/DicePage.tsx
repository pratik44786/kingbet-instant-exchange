import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DicePage = () => {
  const { currentUser, addPoints, removePoints } = useApp();
  const [stake, setStake] = useState(50);
  const [target, setTarget] = useState(50); // roll under
  const [result, setResult] = useState<number | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState<{ roll: number; win: boolean }[]>([]);

  const multiplier = parseFloat((99 / target).toFixed(2));
  const winChance = target;

  const roll = () => {
    if (stake <= 0 || stake > currentUser.balance || rolling) return;
    removePoints(currentUser.id, stake);
    setRolling(true);
    setResult(null);
    setWon(null);

    setTimeout(() => {
      const r = parseFloat((Math.random() * 100).toFixed(2));
      const w = r < target;
      if (w) addPoints(currentUser.id, Math.floor(stake * multiplier));
      setResult(r);
      setWon(w);
      setHistory(prev => [{ roll: r, win: w }, ...prev.slice(0, 19)]);
      setRolling(false);
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <Link to="/casino" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </Link>
        <h2 className="text-lg font-bold text-foreground mb-4">🎲 Dice</h2>

        <div className="surface-card rounded-xl p-8 text-center mb-4">
          {rolling ? (
            <div className="text-5xl animate-spin">🎲</div>
          ) : result !== null ? (
            <div>
              <p className={`text-6xl font-black font-mono ${won ? 'text-positive' : 'text-destructive'}`}>{result}</p>
              <p className={`text-lg font-bold mt-2 ${won ? 'text-positive' : 'text-destructive'}`}>
                {won ? `Won ${Math.floor(stake * multiplier)} PTS` : `Lost ${stake} PTS`}
              </p>
            </div>
          ) : (
            <p className="text-3xl font-bold text-muted-foreground">Roll Under {target}</p>
          )}
        </div>

        <div className="surface-card rounded-lg p-4 mb-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase block mb-1">Roll Under (1-95)</label>
            <input type="range" min={5} max={95} value={target} onChange={e => setTarget(Number(e.target.value))}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Target: {target}</span>
              <span>Win chance: {winChance}%</span>
              <span>Multiplier: {multiplier}x</span>
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground uppercase block mb-1">Stake</label>
              <input type="number" value={stake || ''} onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <button onClick={roll} disabled={rolling || stake <= 0 || stake > currentUser.balance}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40">
              Roll
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {history.map((h, i) => (
            <span key={i} className={`text-xs font-mono font-bold px-2 py-1 rounded ${h.win ? 'bg-positive/20 text-positive' : 'bg-destructive/20 text-destructive'}`}>
              {h.roll}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DicePage;
