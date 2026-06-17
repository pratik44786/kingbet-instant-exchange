import SiteLayout from '@/components/layout/SiteLayout';
import Seo from '@/components/Seo';
import { Users, Link2, TrendingUp, Award, Copy, Check, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

interface ReferralRow {
  referred_user_id: string;
  username: string;
  full_name: string | null;
  level: number;
  total_commission: number;
  kyc_status: string;
  joined_at: string;
}

export default function Referral() {
  const { user, isAuthenticated } = useAuth();
  const { wallet } = useWallet();
  const [copied, setCopied] = useState(false);
  const [refs, setRefs] = useState<ReferralRow[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setRefs([]); return; }
    setLoadingRefs(true);
    supabase.rpc('get_my_referrals').then(({ data, error }) => {
      if (error) console.error('Referrals fetch error:', error);
      setRefs((data as ReferralRow[]) || []);
      setLoadingRefs(false);
    });
  }, [isAuthenticated, user?.id]);

  const totalEarned = wallet?.referral_earnings ?? 0;

  const link = isAuthenticated && user?.referralCode
    ? `${window.location.origin}/register?ref=${user.referralCode}`
    : '';

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteLayout>
      <Seo
        title="Referral Program — Earn Lifetime Crypto Commissions | KingBet Exchange"
        description="Refer friends to KingBet Exchange and earn lifetime commissions on every investment they make. Share your link and grow passive crypto income."
        path="/referral"
      />
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-gold mb-6">
          <Award className="h-3.5 w-3.5" /> Lifetime Commissions
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-extrabold">
          Earn from every <span className="text-gradient-gold">referral</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Earn passive rewards by inviting investors to KINGBET EXCHANGE. Get a percentage of every investment they make — for life.
        </p>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Link2, t: '1. Share your link', d: 'Get a unique referral link from your dashboard.' },
            { icon: Users, t: '2. Friends join', d: 'They sign up using your referral and start investing.' },
            { icon: TrendingUp, t: '3. You earn forever', d: 'Earn commission on every deposit they make.' },
          ].map(s => (
            <div key={s.t} className="card-premium text-center">
              <s.icon className="h-10 w-10 text-gold mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="card-premium max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold mb-2">Your referral link</h2>
          <p className="text-sm text-muted-foreground mb-5">
            {isAuthenticated ? 'Share this anywhere — get rewarded for every signup.' : 'Login to view your unique referral link.'}
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <input readOnly value={link}
                className="flex-1 px-4 py-3 rounded-lg bg-input border border-border font-mono text-sm" />
              <button onClick={copy} className="btn-gold">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Link to="/register" className="btn-gold">Create Account</Link>
              <Link to="/login" className="btn-outline-gold">Login</Link>
            </div>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {[
            { v: '10%', l: 'Level 1 commission' },
            { v: '3%', l: 'Level 2 commission' },
            { v: '1%', l: 'Level 3 commission' },
            { v: '∞', l: 'Lifetime earnings' },
          ].map(s => (
            <div key={s.l} className="card-premium text-center">
              <p className="font-display text-3xl font-extrabold text-gradient-gold">{s.v}</p>
              <p className="text-xs text-muted-foreground mt-2">{s.l}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
