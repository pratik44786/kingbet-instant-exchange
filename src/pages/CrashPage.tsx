import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

type State = 'waiting' | 'running' | 'crashed';

const CrashPage = () => {
  const { currentUser, addPoints, removePoints } = useApp();
  const [stake, setStake] = useState(100);
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [state, setState] = useState<State>('waiting');
  const [hasBet, setHasBet] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [cashoutAt, setCashoutAt] = useState(0);
  const [history, setHistory] = useState<number[]>([3.21, 1.45, 7.89, 1.02, 2.56, 4.33, 1.67]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const startRef = useRef(0);

  const startRound = useCallback(() => {
    const cp = parseFloat((1 + Math.random() * Math.random() * 20).toFixed(2));
    setCrashPoint(cp);
    setMultiplier(1.0);
    setCashedOut(false);
    setCashoutAt(0);
    setState('running');
    startRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const t = (Date.now() - startRef.current) / 1000;
      const m = parseFloat((Math.pow(Math.E, 0.15 * t)).toFixed(2));
      if (m >= cp) {
        setMultiplier(cp);
        setState('crashed');
        setHistory(prev => [cp, ...prev.slice(0, 19)]);
        clearInterval(intervalRef.current);
        setTimeout(() => { setState('waiting'); setHasBet(false); }, 3000);
      } else {
        setMultiplier(m);
      }
    }, 50);
  }, []);

  useEffect(() => {
    if (state === 'waiting') {
      const t = setTimeout(startRound, 2000);
      return () => clearTimeout(t);
    }
    return () => clearInterval(intervalRef.current);
  }, [state, startRound]);

  const placeBet = () => {
    if (stake <= 0 || stake > currentUser.balance || hasBet || state !== 'running') return;
    removePoints(currentUser.id, stake);
    setHasBet(true);
  };

  const cashOut = () => {
    if (!hasBet || cashedOut || state !== 'running') return;
    addPoints(currentUser.id, Math.floor(stake * multiplier));
    setCashedOut(true);
    setCashoutAt(multiplier);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <Link to="/casino" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </Link>
        <h2 className="text-lg font-bold text-foreground mb-4">📈 Crash</h2>

        <div className="surface-card rounded-xl p-8 text-center mb-4">
          {state === 'waiting' && <p className="text-3xl font-bold text-muted-foreground font-mono">Starting...</p>}
          {state === 'running' && <p className="text-6xl font-black font-mono text-positive">{multiplier.toFixed(2)}x</p>}
          {state === 'crashed' && <p className="text-6xl font-black font-mono text-destructive">{crashPoint.toFixed(2)}x</p>}
          {cashedOut && <p className="text-lg font-bold text-positive mt-2">Won {Math.floor(stake * cashoutAt)} PTS at {cashoutAt.toFixed(2)}x</p>}
          {hasBet && !cashedOut && state === 'crashed' && <p className="text-lg font-bold text-destructive mt-2">Lost {stake} PTS</p>}
        </div>

        <div className="surface-card rounded-lg p-4 mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground uppercase block mb-1">Stake</label>
              <input type="number" value={stake || ''} onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            {!hasBet ? (
              <button onClick={placeBet} disabled={state !== 'running' || stake <= 0 || stake > currentUser.balance}
                className="bg-positive text-positive-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40">Bet</button>
            ) : (
              <button onClick={cashOut} disabled={cashedOut || state !== 'running'}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40 animate-pulse">Cash Out</button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {history.map((h, i) => (
            <span key={i} className={`text-xs font-mono font-bold px-2 py-1 rounded ${h >= 2 ? 'bg-positive/20 text-positive' : 'bg-destructive/20 text-destructive'}`}>{h.toFixed(2)}x</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CrashPage;
