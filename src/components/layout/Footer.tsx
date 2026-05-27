import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Send, Mail, Shield } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-card/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-9 w-9" />
              <span className="font-display font-bold text-lg">
                <span className="text-gradient-gold">KINGBET</span> EXCHANGE
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Smart Crypto Investing Platform — grow your wealth with AI-powered portfolio management and institutional-grade security.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Instagram, Send].map((Icon, i) => (
                <a key={i} href="#" aria-label="social" className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[['Home','/'],['About','/about'],['Plans','/plans'],['Referral','/referral']].map(([l,p]) => (
                <li key={p}><Link to={p} className="text-muted-foreground hover:text-gold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Account</h4>
            <ul className="space-y-2 text-sm">
              {[['Login','/login'],['Register','/register'],['Dashboard','/dashboard'],['Deposit','/deposit']].map(([l,p]) => (
                <li key={p}><Link to={p} className="text-muted-foreground hover:text-gold transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold" /> support@kingbetexchange.live</li>
              <li className="flex items-start gap-2"><Shield className="h-4 w-4 mt-0.5 text-gold" /> 24/7 Secured Support</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-xs text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground/80">Risk Disclaimer:</strong> Cryptocurrency investments carry inherent risks. Past performance does not guarantee future returns. Invest only what you can afford to lose.
          </p>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-4">
            <p>© {new Date().getFullYear()} KINGBET EXCHANGE. All Rights Reserved.</p>
            <div className="flex gap-4 flex-wrap">
              <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
              <Link to="/aml" className="hover:text-gold transition-colors">AML</Link>
              <Link to="/risk" className="hover:text-gold transition-colors">Risk</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
