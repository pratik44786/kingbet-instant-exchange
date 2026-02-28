import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ArrowLeft, Gem, Bomb } from 'lucide-react';
import { Link } from 'react-router-dom';

const GRID = 25; // 5x5
const MINE_COUNT = 5;

interface Cell { revealed: boolean; isMine: boolean; }

function createBoard(): Cell[] {
  const cells: Cell[] = Array.from({ length: GRID }, () => ({ revealed: false, isMine: false }));
  const mines = new Set<number>();
  while (mines.size < MINE_COUNT) mines.add(Math.floor(Math.random() * GRID));
  mines.forEach(i => { cells[i].isMine = true; });
  return cells;
}

const MinesPage = () => {
  const { currentUser, addPoints, removePoints } = useApp();
  const [stake, setStake] = useState(50);
  const [board, setBoard] = useState<Cell[]>(createBoard());
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);

  const multiplier = parseFloat((1 + revealed * 0.25).toFixed(2));

  const startGame = () => {
    if (stake <= 0 || stake > currentUser.balance) return;
    removePoints(currentUser.id, stake);
    setBoard(createBoard());
    setPlaying(true);
    setGameOver(false);
    setRevealed(0);
    setCashedOut(false);
  };

  const revealCell = useCallback((idx: number) => {
    if (!playing || gameOver || board[idx].revealed) return;
    const newBoard = [...board];
    newBoard[idx] = { ...newBoard[idx], revealed: true };

    if (newBoard[idx].isMine) {
      // Reveal all
      setBoard(newBoard.map(c => ({ ...c, revealed: true })));
      setGameOver(true);
      setPlaying(false);
    } else {
      setBoard(newBoard);
      setRevealed(prev => prev + 1);
    }
  }, [board, playing, gameOver]);

  const cashOut = () => {
    if (!playing || gameOver || revealed === 0) return;
    addPoints(currentUser.id, Math.floor(stake * multiplier));
    setBoard(board.map(c => ({ ...c, revealed: true })));
    setCashedOut(true);
    setPlaying(false);
  };

  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="max-w-md mx-auto">
        <Link to="/casino" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Casino
        </Link>
        <h2 className="text-lg font-bold text-foreground mb-4">💎 Mines</h2>

        {/* Info */}
        <div className="flex justify-between text-sm mb-3">
          <span className="text-muted-foreground">Gems found: <span className="text-foreground font-bold">{revealed}</span></span>
          <span className="text-muted-foreground">Multiplier: <span className="text-positive font-bold font-mono">{multiplier}x</span></span>
        </div>

        {/* Board */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {board.map((cell, i) => (
            <button key={i} onClick={() => revealCell(i)} disabled={!playing || cell.revealed}
              className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold transition-all
                ${cell.revealed
                  ? cell.isMine
                    ? 'bg-destructive/30 border border-destructive/50'
                    : 'bg-positive/20 border border-positive/50'
                  : 'bg-surface-2 border border-border hover:border-primary/50 hover:bg-surface-3 cursor-pointer'}
                ${!playing && !cell.revealed ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
              {cell.revealed ? (cell.isMine ? <Bomb className="w-5 h-5 text-destructive" /> : <Gem className="w-5 h-5 text-positive" />) : ''}
            </button>
          ))}
        </div>

        {/* Result */}
        {gameOver && !cashedOut && (
          <div className="text-center mb-4">
            <p className="text-lg font-bold text-destructive">💥 Hit a mine! Lost {stake} PTS</p>
          </div>
        )}
        {cashedOut && (
          <div className="text-center mb-4">
            <p className="text-lg font-bold text-positive">✅ Cashed out! Won {Math.floor(stake * multiplier)} PTS at {multiplier}x</p>
          </div>
        )}

        {/* Controls */}
        <div className="surface-card rounded-lg p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground uppercase block mb-1">Stake</label>
              <input type="number" value={stake || ''} onChange={e => setStake(Math.max(0, Number(e.target.value)))} disabled={playing}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary disabled:opacity-50" />
            </div>
            {!playing ? (
              <button onClick={startGame} disabled={stake <= 0 || stake > currentUser.balance}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40">
                Start
              </button>
            ) : (
              <button onClick={cashOut} disabled={revealed === 0}
                className="bg-positive text-positive-foreground px-6 py-2.5 rounded-lg font-bold text-sm disabled:opacity-40">
                Cash Out
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinesPage;
