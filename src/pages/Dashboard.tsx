import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Users, Clock, ArrowRight, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Txn { id: string; type: string; amount: number; description: string | null; created_at: string; }

const CREDIT = new Set(['deposit', 'profit', 'referral', 'referral_bonus', 'investment_return', 'bonus', 'credit']);

export default function Dashboard() {
  const { user } = useAuth();
  const { wallet, loading } = useWallet();
  const [txns, setTxns] = useState<Txn[]>([]);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [growthPct, setGrowthPct] = useState(0);
  const [totals, setTotals] = useState({ deposits: 0, withdrawals: 0 });

  useEffect(() => {
    if (!user) return;
    supabase.from('transactions').select('id,type,amount,description,created_at').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(8).then(({ data }) => setTxns((data as Txn[]) || []));

    // Full history for the portfolio growth chart
    supabase.from('transactions').select('type,amount,created_at').eq('user_id', user.id)
      .order('created_at', { ascending: true }).then(({ data }) => {
        const rows = (data as Txn[]) || [];
        if (rows.length === 0) { setChartData([]); setGrowthPct(0); return; }
        const monthMap = new Map<string, number>();
        let running = 0;
        for (const r of rows) {
          const amt = Number(r.amount) || 0;
          const t = (r.type || '').toLowerCase();
          const signed = amt < 0 ? amt : (CREDIT.has(t) ? amt : -amt);
          running += signed;
          const d = new Date(r.created_at);
          monthMap.set(`${d.getFullYear()}-${d.getMonth()}`, running);
        }
        const entries = Array.from(monthMap.entries()).slice(-6);
        const series = entries.map(([key, value]) => {
          const [, m] = key.split('-').map(Number);
          const label = new Date(2000, m, 1).toLocaleString('en', { month: 'short' });
          return { label, value: Math.max(0, Math.round(value)) };
        });
        setChartData(series);
        if (series.length >= 2) {
          const first = series[0].value || 1;
          setGrowthPct(((series[series.length - 1].value - first) / first) * 100);
        }
      });

    Promise.all([
      supabase.from('deposits').select('amount').eq('user_id', user.id).eq('status', 'approved'),
      supabase.from('withdrawals').select('amount').eq('user_id', user.id).eq('status', 'approved'),
    ]).then(([dep, wd]) => {
      setTotals({
        deposits: (dep.data || []).reduce((s, r: any) => s + Number(r.amount), 0),
        withdrawals: (wd.data || []).reduce((s, r: any) => s + Number(r.amount), 0),
      });
    });
  }, [user]);

  const demoChart = [
    { label: 'M1', value: 1000 }, { label: 'M2', value: 1120 }, { label: 'M3', value: 1210 },
    { label: 'M4', value: 1340 }, { label: 'M5', value: 1480 }, { label: 'M6', value: 1650 },
  ];
  const hasRealChart = chartData.length >= 2;
  const displayChart = hasRealChart ? chartData : demoChart;

  const available = Math.max(0, (wallet?.balance ?? 0) - (wallet?.pending_withdrawal ?? 0));

  const stats = [
    { label: 'Total Balance', value: wallet?.balance ?? 0, icon: Wallet, accent: true },
    { label: 'Available Balance', value: available, icon: Wallet },
    { label: 'Active Investments', value: wallet?.active_investment ?? 0, icon: TrendingUp },
    { label: 'Total Deposits', value: totals.deposits, icon: ArrowDownToLine },
    { label: 'Total Withdrawals', value: totals.withdrawals, icon: ArrowUpFromLine },
    { label: 'Pending Withdrawal', value: wallet?.pending_withdrawal ?? 0, icon: Clock },
    { label: 'Referral Earnings', value: wallet?.referral_earnings ?? 0, icon: Users },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Welcome back, {user?.fullName?.split(' ')[0] || user?.username} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your portfolio at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/deposit" className="btn-gold !py-2 !px-4 text-sm"><ArrowDownToLine className="h-4 w-4" /> Deposit</Link>
          <Link to="/withdraw" className="btn-outline-gold !py-2 !px-4 text-sm"><ArrowUpFromLine className="h-4 w-4" /> Withdraw</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={`card-premium ${s.accent ? 'bg-gradient-to-br from-gold/10 to-transparent border-gold/30' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <s.icon className={`h-5 w-5 ${s.accent ? 'text-gold' : 'text-muted-foreground'}`} />
            </div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`font-display text-xl md:text-2xl font-bold mt-1 ${s.accent ? 'text-gradient-gold' : ''}`}>
              {loading ? '...' : `$${Number(s.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold">Portfolio growth</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="text-success text-sm font-medium">+18.4%</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {[35, 48, 42, 60, 55, 75, 70, 85, 90, 88, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-gold/40 to-gold relative group">
                <div className="absolute inset-x-0 bottom-0 rounded-t-md" style={{ height: `${h}%`, background: 'linear-gradient(to top, hsl(var(--gold)/0.6), hsl(var(--gold)))' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="card-premium">
          <h2 className="font-display text-lg font-semibold mb-1">Total P&L</h2>
          <p className="text-xs text-muted-foreground mb-5">All-time profit</p>
          <p className="font-display text-4xl font-extrabold text-gradient-gold">
            ${Number(wallet?.total_profit_loss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-6 space-y-2">
            <Link to="/plans" className="btn-gold w-full justify-center">
              Start a new plan <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/referral" className="btn-outline-gold w-full justify-center">Invite friends</Link>
          </div>
        </div>
      </div>

      <div className="card-premium">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
          </div>
        </div>
        {txns.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted-foreground">
            No transactions yet. <Link to="/deposit" className="text-gold hover:underline">Make your first deposit</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {txns.map(t => (
              <div key={t.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm font-medium capitalize">{t.type.replace('_', ' ')}</p>
                  <p className="text-xs text-muted-foreground">{t.description || new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <p className={`font-mono font-semibold ${Number(t.amount) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {Number(t.amount) >= 0 ? '+' : ''}${Math.abs(Number(t.amount)).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
