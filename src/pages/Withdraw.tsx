import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Wd { id: string; amount: number; crypto_symbol: string; wallet_address: string; status: string; created_at: string; }

const NETWORKS = [
  { sym: 'USDT', net: 'TRC20' },
  { sym: 'USDT', net: 'BEP20' },
  { sym: 'BTC', net: 'Bitcoin' },
  { sym: 'ETH', net: 'ERC20' },
];

export default function Withdraw() {
  const { user } = useAuth();
  const { wallet, refresh } = useWallet();
  const [sym, setSym] = useState('USDT');
  const [network, setNetwork] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Wd[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('withdrawals').select('id,amount,crypto_symbol,wallet_address,status,created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(15);
    setHistory((data as Wd[]) || []);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (amt > (wallet?.balance || 0)) return toast.error('Insufficient balance');
    if (!address.trim()) return toast.error('Enter wallet address');

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('create-withdrawal', {
      body: { amount: amt, crypto_symbol: sym, network, wallet_address: address.trim() },
    });
    setLoading(false);
    if (error || (data as any)?.error) toast.error((data as any)?.error || error?.message || 'Failed');
    else {
      toast.success('Withdrawal requested — awaiting approval');
      setAmount(''); setAddress('');
      load(); refresh();
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Withdraw funds</h1>
      <p className="text-sm text-muted-foreground mb-8">Withdraw your available balance to any supported crypto wallet.</p>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
        <div className="card-premium">
          <h2 className="font-display text-lg font-semibold mb-4">Request withdrawal</h2>
          <div className="p-3 rounded-lg bg-gold/10 border border-gold/20 mb-5 text-sm">
            Available balance: <span className="text-gold font-bold font-mono">${Number(wallet?.balance || 0).toFixed(2)}</span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium block mb-1.5">Crypto</label>
                <select value={sym} onChange={e => setSym(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none">
                  {['USDT', 'BTC', 'ETH', 'BNB'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Network</label>
                <select value={network} onChange={e => setNetwork(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none">
                  {NETWORKS.filter(n => n.sym === sym).map(n => <option key={n.net}>{n.net}</option>)}
                  {!NETWORKS.find(n => n.sym === sym) && <option>{network}</option>}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Amount (USD)</label>
              <input type="number" step="any" required value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Destination wallet address</label>
              <input required value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your wallet address"
                className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none font-mono text-xs" />
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <p>Double-check the wallet address. Crypto transactions are irreversible. Withdrawals are processed within 24 hours after security review.</p>
            </div>

            <button disabled={loading} className="btn-gold w-full justify-center">
              {loading ? 'Requesting...' : 'Request withdrawal'}
            </button>
          </form>
        </div>

        <div className="card-premium">
          <h2 className="font-display text-lg font-semibold mb-4">Withdrawal history</h2>
          {history.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No withdrawals yet.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map(w => (
                <div key={w.id} className="py-3 border-b border-white/5 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-mono font-semibold">${Number(w.amount).toFixed(2)} {w.crypto_symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{w.wallet_address}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(w.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      w.status === 'approved' ? 'bg-success/15 text-success' :
                      w.status === 'rejected' ? 'bg-destructive/15 text-destructive' :
                      'bg-gold/15 text-gold'
                    }`}>{w.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
