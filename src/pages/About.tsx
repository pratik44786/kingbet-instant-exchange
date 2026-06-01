import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { Shield, Target, Eye, Lock, BarChart3, Users } from 'lucide-react';

const values = [
  { icon: Target, title: 'Our Mission', text: 'Make institutional-grade crypto investing accessible to everyone, with full transparency and security.' },
  { icon: Eye, title: 'Our Vision', text: 'Become the world\'s most trusted crypto investment platform, empowering 10M+ investors by 2030.' },
  { icon: Shield, title: 'Security First', text: 'Every layer — from wallets to APIs — is audited and pen-tested by leading blockchain security firms.' },
];

const trust = [
  { icon: Lock, title: 'Cold Storage', text: '95% of user funds in geo-distributed cold multi-sig wallets.' },
  { icon: BarChart3, title: 'On-Chain Audits', text: 'Quarterly proof-of-reserves published transparently on the blockchain.' },
  { icon: Users, title: 'Risk Management', text: 'Dedicated risk team monitors exposure and liquidity 24/7.' },
];

const team = [
  { name: 'Alexander Reed', role: 'CEO & Co-Founder', initials: 'AR' },
  { name: 'Sarah Mitchell', role: 'Chief Technology Officer', initials: 'SM' },
  { name: 'James Harrison', role: 'Head of Trading', initials: 'JH' },
  { name: 'Emily Chen', role: 'Head of Security', initials: 'EC' },
];

export default function About() {
  return (
    <SiteLayout>
      <Seo
        title="About KingBet Exchange — Secure, AI-Driven Crypto Investing"
        description="Learn about KingBet Exchange: our mission to make institutional-grade crypto investing accessible, secure, and transparent for everyone worldwide."
        path="/about"
      />
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gold mb-6">About KINGBET EXCHANGE</div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight">
          Building the future of <span className="text-gradient-gold">crypto investing</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          KINGBET EXCHANGE was founded by a team of fintech veterans, blockchain engineers, and risk specialists with one mission: turn complex crypto investing into a simple, secure experience.
        </p>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-5">
          {values.map(v => (
            <div key={v.title} className="card-premium">
              <div className="h-12 w-12 rounded-xl bg-gradient-gold flex items-center justify-center mb-4 shadow-gold">
                <v.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-heading">Why investors trust us</h2>
          <p className="mt-4 text-muted-foreground">Security infrastructure designed by experts who built systems at the world's top exchanges.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {trust.map(t => (
            <div key={t.title} className="card-premium text-center">
              <t.icon className="h-10 w-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-heading">Meet the team</h2>
          <p className="mt-4 text-muted-foreground">Decades of combined experience in finance, security, and engineering.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map(p => (
            <div key={p.name} className="card-premium text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-gold flex items-center justify-center shadow-gold mb-4">
                <span className="font-display font-bold text-2xl text-primary-foreground">{p.initials}</span>
              </div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.role}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
