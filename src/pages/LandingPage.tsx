import { Crown, TrendingUp, Gamepad2, Shield, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const liveMatches = [
  { event: 'India vs Australia', sport: '🏏', odds: '1.98 / 2.02', status: 'LIVE' },
  { event: 'Man United vs Liverpool', sport: '⚽', odds: '2.50 / 2.54', status: 'LIVE' },
  { event: 'Djokovic vs Alcaraz', sport: '🎾', odds: '1.65 / 1.70', status: 'LIVE' },
  { event: 'England vs South Africa', sport: '🏏', odds: '1.75 / 1.79', status: 'Starting Soon' },
];

const casinoGames = [
  { name: 'Aviator', icon: '✈️', desc: 'Cash out before crash' },
  { name: 'Plinko', icon: '🎯', desc: 'Drop & multiply' },
  { name: 'Crash', icon: '📈', desc: 'Ride the curve' },
  { name: 'Dice', icon: '🎲', desc: 'Roll & win' },
  { name: 'Mines', icon: '💎', desc: 'Find the gems' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Header */}
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <Crown className="w-7 h-7 text-primary" />
        <span className="text-xl font-bold gold-text">KINGBET EXCHANGE</span>
      </div>
      <nav className="flex items-center gap-4">
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Login</Link>
        <Link to="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">Register</Link>
      </nav>
    </header>

    {/* Hero */}
    <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" /> Live Exchange + Casino
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 leading-tight">
          The Ultimate <span className="gold-text">Points Exchange</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Trade odds in real-time on 1000+ markets. Play casino games. All powered by a points-based system with zero real money.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/exchange" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold text-base hover:opacity-90 transition-opacity">
            <TrendingUp className="w-5 h-5" /> Open Exchange <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/casino" className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-bold text-base hover:bg-surface-3 transition-colors">
            <Gamepad2 className="w-5 h-5" /> Casino Games
          </Link>
        </div>
      </div>
    </section>

    {/* Live Matches */}
    <section className="px-6 pb-12 max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-positive animate-pulse" /> Live Markets
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {liveMatches.map((m, i) => (
          <Link to="/exchange" key={i} className="surface-card rounded-lg p-4 hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{m.sport}</span>
              <span className="text-xs text-positive font-semibold">{m.status}</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{m.event}</p>
            <p className="text-xs font-mono text-muted-foreground">Back / Lay: {m.odds}</p>
          </Link>
        ))}
      </div>
    </section>

    {/* Casino Preview */}
    <section className="px-6 pb-12 max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Gamepad2 className="w-5 h-5 text-primary" /> Casino Games
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {casinoGames.map((g, i) => (
          <Link to="/casino" key={i} className="surface-card rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
            <div className="text-3xl mb-2">{g.icon}</div>
            <p className="text-sm font-bold text-foreground">{g.name}</p>
            <p className="text-xs text-muted-foreground">{g.desc}</p>
          </Link>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="px-6 pb-12 max-w-5xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: TrendingUp, title: 'Real-Time Odds', desc: 'Live odds updating every 2 seconds across 1000+ markets' },
          { icon: Shield, title: 'Points System', desc: 'No real money. Points managed by admins.' },
          { icon: Gamepad2, title: '5 Casino Games', desc: 'Aviator, Plinko, Crash, Dice, and Mines' },
        ].map((f, i) => (
          <div key={i} className="surface-card rounded-lg p-5">
            <f.icon className="w-6 h-6 text-primary mb-3" />
            <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border bg-card px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" />
          <span className="font-bold gold-text">KINGBET EXCHANGE</span>
        </div>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span>About</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 KingBet Exchange. Points-based platform.</p>
      </div>
    </footer>
  </div>
);

export default LandingPage;
