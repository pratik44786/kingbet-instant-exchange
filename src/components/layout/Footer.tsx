import { Link } from 'react-router-dom';
import { Twitter, Facebook, Instagram, Send, Mail, Shield, Phone, MapPin } from 'lucide-react';
import Logo from './Logo';
import { useCompanySettings } from '@/hooks/useCompanySettings';

export default function Footer() {
  const { settings } = useCompanySettings();
  const companyName = settings?.company_name || 'KINGBET EXCHANGE';
  const socials = [
    { Icon: Twitter, url: settings?.twitter_url },
    { Icon: Facebook, url: settings?.facebook_url },
    { Icon: Instagram, url: settings?.instagram_url },
    { Icon: Send, url: settings?.telegram_url },
  ];

  return (
    <footer className="mt-24 border-t border-white/5 bg-card/30 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-9 w-9" />
              <span className="font-display font-bold text-lg">
                <span className="text-gradient-gold">{companyName}</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {settings?.tagline || 'Smart Crypto Investing Platform'} — grow your wealth with institutional-grade security.
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, url }, i) => (
                <a key={i} href={url || '#'} target={url ? '_blank' : undefined} rel="noreferrer" aria-label="social" className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:bg-gold/10 hover:text-gold transition-colors">
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
              <li className="flex items-start gap-2"><Mail className="h-4 w-4 mt-0.5 text-gold" /> {settings?.support_email || 'support@kingbetexchange.live'}</li>
              {settings?.support_phone && <li className="flex items-start gap-2"><Phone className="h-4 w-4 mt-0.5 text-gold" /> {settings.support_phone}</li>}
              {settings?.office_address && <li className="flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-gold" /> {settings.office_address}</li>}
              <li className="flex items-start gap-2"><Shield className="h-4 w-4 mt-0.5 text-gold" /> 24/7 Secured Support</li>
            </ul>
          </div>
        </div>
        {(settings?.ceo_name || settings?.founder_name) && (
          <div className="mt-10 text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
            {settings?.founder_name && <span>Founder: <span className="text-foreground/80">{settings.founder_name}</span></span>}
            {settings?.ceo_name && <span>CEO: <span className="text-foreground/80">{settings.ceo_name}</span></span>}
          </div>
        )}

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
