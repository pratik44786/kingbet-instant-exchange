import SiteLayout from '@/components/layout/SiteLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, Calculator, ArrowRight, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'sonner';

interface Plan {
  id: string; name: string; description: string;
  monthly_return_percent: number; min_deposit: number; max_deposit: number;
  duration_days: number; payout_frequency: string;
}

export default function Plans() {
  const { isAuthenticated } = useAuth();
  const { wallet, refresh } = useWallet();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [amount, setAmount] = useState(1000);
  const [months, setMonths] = useState(6);
  const [investPlan, setInvestPlan] = useState<Plan | null>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from('investment_plans').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      setPlans((data as Plan[]) || []);
    });
  }, []);

  const monthlyProfit = amount * 0.05;
  const totalProfit = monthlyProfit * months;
  const finalValue = amount + totalProfit;

  const confirmInvest = async () => {
    if (!investPlan) return;
    const amt = parseFloat(investAmount);
    if (!amt || amt < investPlan.min_deposit || amt > investPlan.max_deposit) {
      return toast.error(`Amount must be between $${investPlan.min_deposit} and $${investPlan.max_deposit}`);
    }
    if (amt > (wallet?.balance ?? 0)) return toast.error('Insufficient balance. Please deposit first.');
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('create-investment', {
      body: { plan_id: investPlan.id, amount: amt },
    });
    setBusy(false);
    if (error || (data as any)?.error) return toast.error((data as any)?.error || error?.message || 'Failed');
    toast.success(`Invested in ${investPlan.name}`);
    setInvestPlan(null); setInvestAmount('');
    refresh();
    navigate('/dashboard');
  };


  return (
    <SiteLayout>
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <h1 className="font-display text-4xl md:text-6xl font-extrabold">
          Choose your <span className="text-gradient-gold">investment plan</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
          Fixed <span className="text-gold font-semibold">5% monthly returns</span>, fortnightly payouts, full flexibility. Pick the plan that matches your investment size.
        </p>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <div key={p.id} className={`card-premium relative ${i === 1 ? 'ring-2 ring-gold/40' : ''}`}>
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-gold text-primary-foreground text-xs font-bold shadow-gold">
                  MOST POPULAR
                </div>
              )}
              <h3 className="font-display text-2xl font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              <div className="mt-6">
                <p className="font-display text-5xl font-extrabold text-gradient-gold">{p.monthly_return_percent}%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Monthly Returns</p>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                {[
                  `Min: $${Number(p.min_deposit).toLocaleString()}`,
                  `Max: $${Number(p.max_deposit).toLocaleString()}`,
                  `Duration: ${p.duration_days} days`,
                  `Payouts: ${p.payout_frequency}`,
                  'Instant withdrawals',
                  'Referral commissions',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success shrink-0" /> {f}</li>
                ))}
              </ul>
              {isAuthenticated ? (
                <button onClick={() => { setInvestPlan(p); setInvestAmount(String(p.min_deposit)); }} className="btn-gold w-full justify-center mt-6">
                  Invest in {p.name} <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link to="/register" className="btn-gold w-full justify-center mt-6">
                  Start with {p.name} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Profit calculator */}
      <section className="container mx-auto px-4 py-16">
        <div className="card-premium max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center"><Calculator className="h-5 w-5 text-primary-foreground" /></div>
            <h2 className="font-display text-2xl font-bold">Profit Calculator</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium block mb-2">Investment amount (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none text-lg font-semibold" />
                <input type="range" min={100} max={50000} step={100} value={amount}
                  onChange={e => setAmount(Number(e.target.value))} className="w-full mt-3 accent-[hsl(var(--gold))]" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-2">Investment period: {months} months</label>
                <input type="range" min={1} max={24} step={1} value={months}
                  onChange={e => setMonths(Number(e.target.value))} className="w-full accent-[hsl(var(--gold))]" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg glass">
                <p className="text-xs text-muted-foreground">Monthly profit</p>
                <p className="font-display text-2xl font-bold text-success">${monthlyProfit.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg glass">
                <p className="text-xs text-muted-foreground">Total profit</p>
                <p className="font-display text-2xl font-bold text-success">${totalProfit.toFixed(2)}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-gold">
                <p className="text-xs text-primary-foreground/80 font-medium">Final value</p>
                <p className="font-display text-3xl font-extrabold text-primary-foreground">${finalValue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-heading">How it works</h2>
          <p className="mt-4 text-muted-foreground">From signup to first payout in 4 simple steps.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-5">
          {['Create account', 'Deposit crypto', 'Choose a plan', 'Earn fortnightly'].map((s, i) => (
            <div key={s} className="card-premium text-center relative">
              <div className="h-12 w-12 mx-auto rounded-full bg-gradient-gold flex items-center justify-center font-display font-bold text-primary-foreground mb-3 shadow-gold">{i+1}</div>
              <p className="font-semibold">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
