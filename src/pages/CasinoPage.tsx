import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const games = [
  { name: 'Aviator', icon: '✈️', desc: 'Watch the multiplier climb. Cash out before it crashes!', path: '/casino/aviator', color: 'from-red-500/20 to-orange-500/20' },
  { name: 'Plinko', icon: '🎯', desc: 'Drop the ball and watch it bounce to a multiplier slot.', path: '/casino/plinko', color: 'from-blue-500/20 to-cyan-500/20' },
  { name: 'Crash', icon: '📈', desc: 'Ride the curve up. Exit before it crashes to zero.', path: '/casino/crash', color: 'from-green-500/20 to-emerald-500/20' },
  { name: 'Dice', icon: '🎲', desc: 'Roll the dice and bet on the outcome.', path: '/casino/dice', color: 'from-purple-500/20 to-pink-500/20' },
  { name: 'Mines', icon: '💎', desc: 'Uncover gems and avoid the mines for bigger wins.', path: '/casino/mines', color: 'from-yellow-500/20 to-amber-500/20' },
];

const CasinoPage = () => (
  <div className="flex-1 p-4 overflow-auto">
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-primary" /> Casino Games
      </h2>
      <p className="text-sm text-muted-foreground mb-6">Play with your points. All games are provably fair.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map(g => (
          <Link key={g.name} to={g.path}
            className="surface-card rounded-xl p-6 hover:border-primary/50 transition-all group relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            <div className="relative z-10">
              <div className="text-4xl mb-3">{g.icon}</div>
              <h3 className="text-base font-bold text-foreground mb-1">{g.name}</h3>
              <p className="text-xs text-muted-foreground">{g.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default CasinoPage;
