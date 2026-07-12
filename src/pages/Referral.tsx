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
              <h2 className="font-display text-lg font-semibold">{s.t}</h2>
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

      {isAuthenticated && (
        <section className="container mx-auto px-4 py-6">
          <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto mb-8">
            <div className="card-premium flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center"><Users className="h-6 w-6 text-gold" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Referrals</p>
                <p className="font-display text-2xl font-bold">{refs.length}</p>
              </div>
            </div>
            <div className="card-premium flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gold/10 flex items-center justify-center"><Gift className="h-6 w-6 text-gold" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Rewards Earned</p>
                <p className="font-display text-2xl font-bold text-gradient-gold">${Number(totalEarned).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="card-premium max-w-4xl mx-auto">
            <h2 className="font-display text-xl font-bold mb-4">Your referrals</h2>
            {loadingRefs ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
            ) : refs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No referrals yet. Share your link to start earning rewards.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b border-white/5">
                      <th className="py-2 pr-4 font-medium">User</th>
                      <th className="py-2 pr-4 font-medium">Status</th>
                      <th className="py-2 pr-4 font-medium">Level</th>
                      <th className="py-2 pr-4 font-medium text-right">Reward</th>
                      <th className="py-2 font-medium text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refs.map(r => (
                      <tr key={r.referred_user_id} className="border-b border-white/5 last:border-0">
                        <td className="py-3 pr-4 font-medium">{r.full_name || r.username}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                            r.kyc_status === 'approved' ? 'bg-success/15 text-success' :
                            r.kyc_status === 'rejected' ? 'bg-destructive/15 text-destructive' :
                            'bg-gold/15 text-gold'
                          }`}>{r.kyc_status === 'approved' ? 'Verified' : r.kyc_status === 'rejected' ? 'Rejected' : 'Pending'}</span>
                        </td>
                        <td className="py-3 pr-4">L{r.level}</td>
                        <td className="py-3 pr-4 text-right font-mono text-success">+${Number(r.total_commission).toFixed(2)}</td>
                        <td className="py-3 text-right text-muted-foreground">{new Date(r.joined_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}


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
