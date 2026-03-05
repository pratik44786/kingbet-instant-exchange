import { Crown, TrendingUp, Gamepad2, Shield, Zap, ArrowRight, Users, Lock, Globe, Star, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const liveSports = [
{ event: 'India vs Australia', sport: '🏏', competition: 'ICC World Cup 2026', odds1: '1.98', odds2: '2.02', oddsX: '-', status: 'LIVE', time: '2nd Innings' },
{ event: 'Man United vs Liverpool', sport: '⚽', competition: 'Premier League', odds1: '2.50', oddsX: '3.20', odds2: '2.54', status: 'LIVE', time: '67 min' },
{ event: 'Djokovic vs Alcaraz', sport: '🎾', competition: 'Australian Open', odds1: '1.65', odds2: '1.70', oddsX: '-', status: 'LIVE', time: 'Set 3' },
{ event: 'England vs South Africa', sport: '🏏', competition: 'Ashes 2026', odds1: '1.75', odds2: '1.79', oddsX: '-', status: 'Soon', time: 'Starts 3:00 PM' },
{ event: 'Arsenal vs Chelsea', sport: '⚽', competition: 'FA Cup', odds1: '1.90', oddsX: '3.40', odds2: '3.10', status: 'Soon', time: 'Starts 8:00 PM' },
{ event: 'CSK vs MI', sport: '🏏', competition: 'IPL 2026', odds1: '1.85', odds2: '1.95', oddsX: '-', status: 'LIVE', time: '1st Innings' },
];

const casinoGames = [
{ name: 'Aviator', icon: '✈️', desc: 'Cash out before crash', players: '2.4k', color: 'from-red-600/30 to-orange-600/30' },
{ name: 'Plinko', icon: '🎯', desc: 'Drop & multiply', players: '1.8k', color: 'from-blue-600/30 to-cyan-600/30' },
{ name: 'Crash', icon: '📈', desc: 'Ride the curve', players: '3.1k', color: 'from-green-600/30 to-emerald-600/30' },
{ name: 'Dice', icon: '🎲', desc: 'Roll & win', players: '1.2k', color: 'from-purple-600/30 to-pink-600/30' },
{ name: 'Mines', icon: '💎', desc: 'Find the gems', players: '2.0k', color: 'from-yellow-600/30 to-amber-600/30' },
{ name: 'Roulette', icon: '🎰', desc: 'Spin to win', players: '1.5k', color: 'from-red-600/30 to-rose-600/30' },
{ name: 'Baccarat', icon: '🃏', desc: 'Classic card game', players: '900', color: 'from-indigo-600/30 to-blue-600/30' },
{ name: 'Teen Patti', icon: '🂠', desc: 'Indian poker', players: '4.2k', color: 'from-orange-600/30 to-yellow-600/30' },
];

const sports = [
{ name: 'Cricket', icon: '🏏', count: '300+' },
{ name: 'Football', icon: '⚽', count: '400+' },
{ name: 'Tennis', icon: '🎾', count: '300+' },
{ name: 'Basketball', icon: '🏀', count: '50+' },
{ name: 'Horse Racing', icon: '🏇', count: '80+' },
{ name: 'Kabaddi', icon: '🤼', count: '30+' },
];

const stats = [
{ label: 'Live Markets', value: '1000+' },
{ label: 'Active Users', value: '50K+' },
{ label: 'Daily Bets', value: '100K+' },
{ label: 'Casino Games', value: '20+' },
];

const LandingPage = () => (

  <div className="min-h-screen bg-[#0b1221] flex flex-col text-white">  
    {/* ─── Top Bar ─── */}  
    <div className="bg-[#060d18] border-b border-white/5 py-1.5 px-4 flex items-center justify-between text-[10px] text-gray-500">  
      <div className="flex items-center gap-4">  
        <span>🔒 Secure Platform</span>  
        <span>📞 24/7 Support</span>  
      </div>  
      <span>Points-Based Exchange • No Real Money</span>  
    </div>  {/* ─── Header ─── */}  
<header className="h-16 bg-[#0f1829] border-b border-white/5 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-50">  
  <div className="flex items-center gap-2">  
    <Crown className="w-8 h-8 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)]" />  
    <span className="text-xl font-black text-white tracking-tighter">  
      KING<span className="text-yellow-500">BET</span>  
    </span>  
    <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold uppercase ml-1">Exchange</span>  
  </div>  

  {/* Desktop nav links */}  
  <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">  
    <a href="#sports" className="hover:text-yellow-500 transition-colors">Sports</a>  
    <a href="#casino" className="hover:text-yellow-500 transition-colors">Casino</a>  
    <a href="#features" className="hover:text-yellow-500 transition-colors">Features</a>  
    <a href="#about" className="hover:text-yellow-500 transition-colors">About</a>  
  </nav>  

  <div className="flex items-center gap-2">  
    <Link to="/login" className="text-sm text-gray-300 hover:text-yellow-500 transition-colors font-medium px-3 py-2">  
      Login  
    </Link>  
    <Link to="/login" className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold transition-colors">  
      Get ID  
    </Link>
  </div>  
</header>  

{/* ─── Hero Section ─── */}  
<section className="relative overflow-hidden py-16 lg:py-24 px-4 lg:px-8">  
  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 via-transparent to-transparent" />  
  <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />  
  <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />  

  <div className="relative z-10 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">  
    <div className="flex-1 text-center lg:text-left">  
      <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6">  
        <Zap className="w-3 h-3" /> LIVE NOW • 1000+ Markets Open  
      </div>  
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">  
        India's Premier  
        <br />  
        <span className="text-yellow-500">Points Exchange</span>  
        <br />  
        Platform  
      </h1>  
      <p className="text-gray-400 text-lg mb-8 max-w-xl">  
        Trade odds in real-time. Play casino games. Back & Lay on 1000+ cricket, football, and tennis markets — all powered by a points-based system.  
      </p>  
      <div className="flex gap-3 justify-center lg:justify-start flex-wrap">  
        <Link to="/login" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3.5 rounded-lg font-bold text-base transition-colors shadow-lg shadow-yellow-900/30">  
          <TrendingUp className="w-5 h-5" /> Start Trading <ArrowRight className="w-4 h-4" />  
        </Link>  
        <Link to="/login" className="flex items-center gap-2 bg-[#1e273e] hover:bg-[#283550] border border-white/10 text-white px-8 py-3.5 rounded-lg font-bold text-base transition-colors">  
          <Gamepad2 className="w-5 h-5" /> Get Your ID  
        </Link>  
      </div>  
    </div>  

    {/* Stats Grid */}  
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">  
      {stats.map((s, i) => (  
        <div key={i} className="bg-[#161d2f] border border-white/5 rounded-xl p-5 text-center">  
          <p className="text-2xl font-black text-yellow-500">{s.value}</p>  
          <p className="text-xs text-gray-500 font-semibold uppercase mt-1">{s.label}</p>  
        </div>  
      ))}  
    </div>  
  </div>  
</section>  

{/* ─── Live Markets Ticker ─── */}  
<section id="sports" className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <div className="flex items-center justify-between mb-4">  
    <h2 className="text-lg font-bold flex items-center gap-2">  
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />  
      Live Markets  
    </h2>  
    <Link to="/login" className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold flex items-center gap-1">  
      View All <ChevronRight className="w-3 h-3" />  
    </Link>  
  </div>  

  {/* Match List - Diamond Exchange style */}  
  <div className="bg-[#161d2f] rounded-lg border border-white/5 overflow-hidden">  
    {/* Table Header */}  
    <div className="grid grid-cols-12 bg-[#1e273e] px-3 py-2 text-[10px] font-bold text-gray-500 uppercase border-b border-white/5">  
      <div className="col-span-5">Event</div>  
      <div className="col-span-2 text-center">1</div>  
      <div className="col-span-2 text-center">X</div>  
      <div className="col-span-2 text-center">2</div>  
      <div className="col-span-1 text-center">⚡</div>  
    </div>  

    {liveSports.map((m, i) => (  
      <Link to="/login" key={i} className="grid grid-cols-12 items-center px-3 py-2.5 border-b border-white/5 last:border-0 hover:bg-[#1e273e] transition-colors group">  
        <div className="col-span-5 flex items-center gap-2">  
          <span className="text-lg">{m.sport}</span>  
          <div>  
            <p className="text-xs font-semibold text-gray-200">{m.event}</p>  
            <div className="flex items-center gap-2 mt-0.5">  
              <span className="text-[9px] text-gray-500">{m.competition}</span>  
              <span className={`text-[9px] font-bold ${m.status === 'LIVE' ? 'text-green-500' : 'text-yellow-500'}`}>  
                • {m.status === 'LIVE' ? m.time : m.time}  
              </span>  
            </div>  
          </div>  
        </div>  
        <div className="col-span-2 flex justify-center">  
          <span className="btn-back !min-w-[52px] !min-h-[32px] text-[11px] font-bold rounded">{m.odds1}</span>  
        </div>  
        <div className="col-span-2 flex justify-center">  
          {m.oddsX !== '-' ? (  
            <span className="btn-back !min-w-[52px] !min-h-[32px] text-[11px] font-bold rounded">{m.oddsX}</span>  
          ) : (  
            <span className="text-gray-600 text-xs">-</span>  
          )}  
        </div>  
        <div className="col-span-2 flex justify-center">  
          <span className="btn-lay !min-w-[52px] !min-h-[32px] text-[11px] font-bold rounded">{m.odds2}</span>  
        </div>  
        <div className="col-span-1 flex justify-center">  
          {m.status === 'LIVE' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}  
        </div>  
      </Link>  
    ))}  
  </div>  
</section>  

{/* ─── Sports Categories ─── */}  
<section className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">  
    <Globe className="w-5 h-5 text-yellow-500" /> All Sports  
  </h2>  
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">  
    {sports.map((s, i) => (  
      <Link to="/login" key={i} className="bg-[#161d2f] border border-white/5 rounded-lg p-4 text-center hover:border-yellow-500/30 transition-all group">  
        <div className="text-3xl mb-2">{s.icon}</div>  
        <p className="text-xs font-bold text-gray-200">{s.name}</p>  
        <p className="text-[10px] text-yellow-500 font-semibold mt-0.5">{s.count} markets</p>  
      </Link>  
    ))}  
  </div>  
</section>  

{/* ─── Casino Games ─── */}  
<section id="casino" className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <div className="flex items-center justify-between mb-4">  
    <h2 className="text-lg font-bold flex items-center gap-2">  
      <Gamepad2 className="w-5 h-5 text-yellow-500" /> Casino & Live Games  
    </h2>  
    <Link to="/login" className="text-xs text-yellow-500 hover:text-yellow-400 font-semibold flex items-center gap-1">  
      Play All <ChevronRight className="w-3 h-3" />  
    </Link>  
  </div>  
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">  
    {casinoGames.map((g, i) => (  
      <Link to="/login" key={i} className="relative bg-[#161d2f] border border-white/5 rounded-lg p-5 text-center hover:border-yellow-500/30 transition-all group overflow-hidden">  
        <div className={`absolute inset-0 bg-gradient-to-br ${g.color} opacity-0 group-hover:opacity-100 transition-opacity`} />  
        <div className="relative z-10">  
          <div className="text-4xl mb-2">{g.icon}</div>  
          <p className="text-sm font-bold text-gray-200">{g.name}</p>  
          <p className="text-[10px] text-gray-500">{g.desc}</p>  
          <p className="text-[9px] text-green-500 font-semibold mt-1">👥 {g.players} playing</p>  
        </div>  
      </Link>  
    ))}  
  </div>  
</section>  

{/* ─── Features ─── */}  
<section id="features" className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <h2 className="text-lg font-bold mb-6 text-center">Why Choose <span className="text-yellow-500">KingBet</span> Exchange?</h2>  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
    {[  
      { icon: TrendingUp, title: 'Real-Time Odds', desc: 'Live odds updating every 2 seconds. Back & Lay with instant matching.' },  
      { icon: Shield, title: 'Points System', desc: 'No real money involved. Admin-managed points with full transparency.' },  
      { icon: Lock, title: 'Secure Platform', desc: 'Enterprise-grade encryption. Your account is protected 24/7.' },  
      { icon: Users, title: 'Admin Hierarchy', desc: 'Super Admin → Admin → User system with full control chain.' },  
    ].map((f, i) => (  
      <div key={i} className="bg-[#161d2f] border border-white/5 rounded-lg p-5">  
        <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-3">  
          <f.icon className="w-5 h-5 text-yellow-500" />  
        </div>  
        <h3 className="text-sm font-bold text-gray-200 mb-1">{f.title}</h3>  
        <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>  
      </div>  
    ))}  
  </div>  
</section>  

{/* ─── How It Works ─── */}  
<section className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <h2 className="text-lg font-bold mb-6 text-center">Get Started in <span className="text-yellow-500">3 Steps</span></h2>  
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">  
    {[  
      { step: '01', title: 'Get Your ID', desc: 'Contact us on WhatsApp to receive your unique betting ID and password.' },  
      { step: '02', title: 'Add Points', desc: 'Your admin will add points to your account. No real money transactions.' },  
      { step: '03', title: 'Start Trading', desc: 'Place bets on live markets or play casino games. Withdraw winnings via admin.' },  
    ].map((s, i) => (  
      <div key={i} className="bg-[#161d2f] border border-white/5 rounded-lg p-6 relative overflow-hidden">  
        <span className="absolute top-2 right-4 text-5xl font-black text-yellow-500/10">{s.step}</span>  
        <div className="relative z-10">  
          <div className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center text-sm font-black mb-3">{s.step}</div>  
          <h3 className="text-sm font-bold text-gray-200 mb-1">{s.title}</h3>  
          <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>  
        </div>  
      </div>  
    ))}  
  </div>  
</section>  

{/* ─── CTA Section ─── */}  
<section className="px-4 lg:px-8 pb-12 max-w-6xl mx-auto w-full">  
  <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/20 rounded-2xl p-8 lg:p-12 text-center">  
    <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />  
    <h2 className="text-2xl lg:text-3xl font-black mb-3">Ready to Start Trading?</h2>  
    <p className="text-gray-400 mb-6 max-w-lg mx-auto">Join thousands of users on India's most trusted points-based exchange platform.</p>  
    <div className="flex gap-3 justify-center flex-wrap">  
      <Link to="/register" className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-yellow-900/30">  
        Get Your ID Now <ArrowRight className="w-4 h-4" />  
      </Link>  
      <Link to="/login" className="flex items-center gap-2 bg-[#1e273e] hover:bg-[#283550] border border-white/10 text-white px-8 py-3 rounded-lg font-bold transition-colors">  
        Login  
      </Link>  
    </div>  
  </div>  
</section>  

{/* ─── Footer ─── */}  
<footer id="about" className="bg-[#060d18] border-t border-white/5 px-4 lg:px-8 py-10">  
  <div className="max-w-6xl mx-auto">  
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">  
      {/* Brand */}  
      <div>  
        <div className="flex items-center gap-2 mb-3">  
          <Crown className="w-6 h-6 text-yellow-500" />  
          <span className="font-black text-lg">KING<span className="text-yellow-500">BET</span></span>  
        </div>  
        <p className="text-xs text-gray-500 leading-relaxed mb-3">  
          India's premier points-based betting exchange platform. Trade odds on 1000+ markets across Cricket, Football, and Tennis.  
        </p>  
        <div className="flex gap-3">  
          {['📱', '💬', '📧'].map((e, i) => (  
            <span key={i} className="w-8 h-8 bg-[#161d2f] rounded-full flex items-center justify-center text-sm cursor-pointer hover:bg-yellow-500/20 transition-colors">{e}</span>  
          ))}  
        </div>  
      </div>  

      {/* Quick Links */}  
      <div>  
        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3">Quick Links</h4>  
        <div className="space-y-2">  
          {['Exchange', 'Casino', 'Cricket', 'Football', 'Tennis'].map((l, i) => (  
            <Link key={i} to="/login" className="block text-xs text-gray-500 hover:text-yellow-500 transition-colors">{l}</Link>  
          ))}  
        </div>  
      </div>  

      {/* Support */}  
      <div>  
        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3">Support</h4>  
        <div className="space-y-2">  
          {['About Us', 'Terms & Conditions', 'Privacy Policy', 'Responsible Gaming', 'FAQ'].map((l, i) => (  
            <span key={i} className="block text-xs text-gray-500 hover:text-yellow-500 transition-colors cursor-pointer">{l}</span>  
          ))}  
        </div>  
      </div>  

      {/* Contact */}  
      <div>  
        <h4 className="text-xs font-bold text-gray-300 uppercase mb-3">Contact Us</h4>  
        <div className="space-y-3">  
          <div className="flex items-center gap-2 text-xs text-gray-500">  
            <Phone className="w-3 h-3 text-yellow-500" /> WhatsApp: +91 98765 43210  
          </div>  
          <div className="flex items-center gap-2 text-xs text-gray-500">  
            <Mail className="w-3 h-3 text-yellow-500" /> support@kingbet.com  
          </div>  
          <div className="flex items-center gap-2 text-xs text-gray-500">  
            <MapPin className="w-3 h-3 text-yellow-500" /> 24/7 Online Support  
          </div>  
        </div>  
      </div>  
    </div>  

    <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">  
      <p className="text-[10px] text-gray-600">© 2026 KingBet Exchange. All rights reserved. Points-based platform only.</p>  
      <div className="flex gap-4 text-[10px] text-gray-600">  
        <span className="hover:text-yellow-500 cursor-pointer">Terms</span>  
        <span className="hover:text-yellow-500 cursor-pointer">Privacy</span>  
        <span className="hover:text-yellow-500 cursor-pointer">Cookies</span>  
      </div>  
    </div>  
  </div>  
</footer>

  </div>  
);

export default LandingPage;
