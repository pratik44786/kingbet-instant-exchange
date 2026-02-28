import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type GameState = 'waiting' | 'flying' | 'crashed';

const AviatorPage = () => {
  const { currentUser, addPoints, removePoints } = useApp();
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [state, setState] = useState<GameState>('waiting');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [history, setHistory] = useState<number[]>([2.35, 1.12, 5.67, 1.89, 3.45, 1.05, 8.23, 2.10]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startTimeRef = useRef(0);

  const startRound = useCallback(() => {
    const cp = parseFloat((1 + Math.random() * Math.random() * 15).toFixed(2));
    setCrashPoint(cp);
    setMultiplier(1.0);
    setCashedOut(false);
    setCashoutMultiplier(0);
    setState('flying');
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const m = parseFloat((1 + elapsed * 0.5 + elapsed * elapsed * 0.05).toFixed(2));
      if (m >= cp) {
        setMultiplier(cp);
        setState('crashed');
        setHistory(prev => [cp, ...prev.slice(0, 19)]);
        clearInterval(intervalRef.current);
        // Auto restart after 3s
        setTimeout(() => {
          setState('waiting');
          setHasBet(false);
        }, 3000);
      } else {
        setMultiplier(m);
      }
    }, 50);
  }, []);

  useEffect(() => {
    // Auto-start rounds
    if (state === 'waiting') {
      const t = setTimeout(startRound, 2000);
      return () => clearTimeout(t);
    }
    return () => clearInterval(intervalRef.current);
  }, [state, startRound]);

  const placeBet = () => {
    if (stake <= 0 || stake > currentUser.balance || state !== 'flying' || hasBet) return;
    removePoints(currentUser.id, stake);
    setHasBet(true);
  };

  const cashOut = () => {
    if (!hasBet || cashedOut || state !== 'flying') return;
    const winnings = Math.floor(stake * multiplier);
    addPoints(currentUser.id, winnings);
    setCashedOut(true);
    setCashoutMultiplier(multiplier);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <Link to="/casino" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </Link>

        <h2 className="text-lg font-bold text-foreground mb-4">✈️ Aviator</h2>

        {/* Multiplier Display */}
        <div className="surface-card rounded-xl p-8 text-center mb-4 relative overflow-hidden">
          <div className={`absolute inset-0 ${state === 'crashed' ? 'bg-destructive/10' : state === 'flying' ? 'bg-positive/5' : 'bg-surface-2'}`} />
          <div className="relative z-10">
            {state === 'waiting' && (
              <div>
                <p className="text-muted-foreground text-sm mb-2">Next round starting...</p>
                <p className="text-4xl font-bold font-mono text-foreground">Waiting</p>
              </div>
            )}
            {state === 'flying' && (
              <div>
                <p className="text-sm text-positive mb-1">✈️ Flying...</p>
                <p className="text-6xl font-black font-mono text-positive">{multiplier.toFixed(2)}x</p>
              </div>
            )}
            {state === 'crashed' && (
              <div>
                <p className="text-sm text-destructive mb-1">💥 Crashed!</p>
                <p className="text-6xl font-black font-mono text-destructive">{crashPoint.toFixed(2)}x</p>
              </div>
            )}
            {cashedOut && (
              <p className="text-lg font-bold text-positive mt-3">
                ✅ Cashed out at {cashoutMultiplier.toFixed(2)}x — Won {Math.floor(stake * cashoutMultiplier)} PTS
              </p>
            )}
            {hasBet && !cashedOut && state === 'crashed' && (
              <p className="text-lg font-bold text-destructive mt-3">
                ❌ Lost {stake} PTS
              </p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="surface-card rounded-lg p-4 mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground uppercase block mb-1">Stake (PTS)</label>
              <input type="number" value={stake || ''} onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            {!hasBet ? (
              <button onClick={placeBet} disabled={state !== 'flying' || stake <= 0 || stake > currentUser.balance}
                className="bg-positive text-positive-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity">
                Place Bet
              </button>
            ) : (
              <button onClick={cashOut} disabled={cashedOut || state !== 'flying'}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity animate-pulse">
                Cash Out
              </button>
            )}
          </div>
        </div>

        {/* History */}
        <div className="flex flex-wrap gap-2">
          {history.map((h, i) => (
            <span key={i} className={`text-xs font-mono font-bold px-2 py-1 rounded ${h >= 2 ? 'bg-positive/20 text-positive' : 'bg-destructive/20 text-destructive'}`}>
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AviatorPage;
