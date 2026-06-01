import SiteLayout from '@/components/layout/SiteLayout';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Brain, Zap, Users, TrendingUp, Lock, BarChart3, Wallet, Check, Star } from 'lucide-react';

const stats = [
  { label: 'Total Investors', value: '152,438', sub: '+12% this month' },
  { label: 'Total Withdrawals', value: '$48.2M', sub: 'Instant processing' },
  { label: 'Active Investments', value: '$112M', sub: 'Across 50+ assets' },
  { label: 'Daily Transactions', value: '24,891', sub: '99.9% uptime' },
];

const features = [
  { icon: Shield, title: 'Bank-Grade Security', desc: 'Cold storage, multi-sig wallets, and 256-bit AES encryption protect every transaction.' },
  { icon: Brain, title: 'AI Portfolio Management', desc: 'Smart algorithms rebalance your portfolio in real-time for optimal returns.' },
  { icon: Zap, title: 'Instant Withdrawals', desc: 'Withdraw your profits anytime — processed within minutes, not days.' },
  { icon: Users, title: 'Referral Earnings', desc: 'Earn lifetime commissions from every investor you refer to KINGBET.' },
  { icon: Lock, title: 'Blockchain Transparency', desc: 'Every transaction recorded on-chain. Full audit trail, always.' },
  { icon: BarChart3, title: 'Real-Time Analytics', desc: 'Track profits, performance, and portfolio health with premium dashboards.' },
];

const cryptos = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'TRX', 'MATIC'];

const testimonials = [
  { name: 'Michael T.', role: 'Investor • 2 yrs', text: 'I have earned consistent fortnightly payouts since day one. KINGBET feels institutional-grade.', rating: 5 },
  { name: 'Jessica L.', role: 'Investor • 14 mo', text: 'Withdrawals are truly instant. Customer support actually responds. Rare combo in crypto.', rating: 5 },
  { name: 'Daniel R.', role: 'Investor • 8 mo', text: 'The 5% monthly return is real. My portfolio compounded faster than any traditional savings.', rating: 5 },
];

const faqs = [
  { q: 'How does KINGBET EXCHANGE generate 5% monthly returns?', a: 'Our AI engine spreads capital across staking, market making, and arbitrage strategies on top-tier exchanges to deliver consistent fortnightly profit distributions.' },
  { q: 'Is my crypto safe?', a: 'Yes. 95% of user funds are kept in cold multi-signature wallets, with the remainder in insured hot wallets for liquidity.' },
  { q: 'What is the minimum investment?', a: 'The Starter plan begins at $100. You can upgrade to Premium or Elite anytime from your dashboard.' },
  { q: 'When are profits paid out?', a: 'Profits are credited to your wallet fortnightly. You can reinvest or withdraw at any time.' },
  { q: 'How does the referral program work?', a: 'Share your unique referral link — earn a percentage of every investment your invitees make, for life.' },
];

export default function Home() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
        <div className="container mx-auto px-4 pt-20 pb-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gold">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-glow-pulse" />
                Trusted by 150,000+ investors worldwide
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Grow Your <span className="text-gradient-gold">Crypto Wealth</span> with KINGBET EXCHANGE
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Smart, secure, AI-driven crypto investing. Earn up to <span className="text-gold font-semibold">5% monthly returns</span> with fortnightly payouts, instant withdrawals, and lifetime referral commissions.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/register" className="btn-gold">Start Investing <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/plans" className="btn-outline-gold">View Plans</Link>
              </div>
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => <div key={i} className="h-8 w-8 rounded-full bg-gradient-gold border-2 border-background" />)}
                </div>
                <div>
                  <div className="flex text-gold">{Array.from({length:5}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Rated 4.9 / 5 by investors</p>
                </div>
              </div>
            </div>

            {/* Hero visual: floating dashboard cards */}
            <div className="relative h-[500px] hidden lg:block">
              <div className="absolute top-0 right-0 w-72 card-premium animate-float">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">Portfolio Value</span>
                  <span className="text-success text-xs">+24.7%</span>
                </div>
                <p className="font-display text-3xl font-bold text-gradient-gold">$48,291.40</p>
                <div className="mt-4 flex items-end gap-1 h-16">
                  {[40,55,45,70,60,80,75,90,85,95].map((h,i)=>(
                    <div key={i} className="flex-1 bg-gradient-gold rounded-sm opacity-80" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>
              <div className="absolute bottom-10 left-0 w-64 card-premium animate-float" style={{ animationDelay: '1.5s' }}>
                <p className="text-xs text-muted-foreground mb-2">Active Plan</p>
                <p className="font-display text-xl font-bold">Premium Investor</p>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Monthly ROI</span>
                  <span className="text-gold font-bold">5.0%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-gold w-3/4" />
                </div>
              </div>
              <div className="absolute top-32 left-12 w-56 card-premium animate-float" style={{ animationDelay: '3s' }}>
                <p className="text-xs text-muted-foreground">Next Payout</p>
                <p className="font-display text-2xl font-bold text-success mt-1">+$1,207.85</p>
                <p className="text-xs text-muted-foreground mt-2">In 6 days</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card-premium text-center">
              <p className="font-display text-2xl lg:text-4xl font-bold text-gradient-gold">{s.value}</p>
              <p className="mt-2 text-sm font-medium text-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="section-heading">Why choose <span className="text-gradient-gold">KINGBET EXCHANGE</span></h2>
          <p className="mt-4 text-muted-foreground">Built for serious investors who demand security, transparency, and consistent returns.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="card-premium group">
              <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported crypto */}
      <section className="container mx-auto px-4 py-16">
        <div className="card-premium">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold">Supported Assets</h3>
              <p className="text-muted-foreground text-sm mt-1">Invest, deposit, and withdraw in the world's top cryptocurrencies.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {cryptos.map(c => (
                <span key={c} className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold text-sm font-mono font-semibold border border-gold/20">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-heading">Loved by investors</h2>
          <p className="mt-4 text-muted-foreground">Real stories from the KINGBET community.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map(t => (
            <div key={t.name} className="card-premium">
              <div className="flex text-gold mb-3">{Array.from({length:t.rating}).map((_,i)=><Star key={i} className="h-4 w-4 fill-current" />)}</div>
              <p className="text-sm text-foreground/90 italic leading-relaxed">"{t.text}"</p>
              <div className="mt-5 pt-4 border-t border-white/5">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">
          <div>
            <h2 className="section-heading">Frequently asked questions</h2>
            <p className="mt-4 text-muted-foreground">Got more? Email <span className="text-gold">support@kingbetexchange.live</span></p>
          </div>
          <div className="space-y-3">
            {faqs.map(f => (
              <details key={f.q} className="card-premium group cursor-pointer">
                <summary className="font-semibold flex justify-between items-center list-none">
                  {f.q} <span className="text-gold group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="card-premium text-center max-w-3xl mx-auto">
          <Wallet className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="section-heading">Start your crypto journey today</h2>
          <p className="mt-4 text-muted-foreground">Join 150,000+ investors earning passive crypto income with KINGBET EXCHANGE.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register" className="btn-gold">Create Free Account <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/plans" className="btn-outline-gold">Explore Plans</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
