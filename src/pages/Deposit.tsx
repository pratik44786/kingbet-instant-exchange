import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Copy, Check, Upload, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

interface Addr {
  id: string; crypto_symbol: string; crypto_name: string; network: string;
  wallet_address: string; qr_image_url: string | null; min_deposit: number;
}

interface Deposit { id: string; amount: number; crypto_symbol: string; status: string; created_at: string; }

export default function Deposit() {
  const { user } = useAuth();
  const [addrs, setAddrs] = useState<Addr[]>([]);
  const [selected, setSelected] = useState<Addr | null>(null);
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);

  const loadDeposits = async () => {
    if (!user) return;
    const { data } = await supabase.from('deposits').select('id,amount,crypto_symbol,status,created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(10);
    setDeposits((data as Deposit[]) || []);
  };

  useEffect(() => {
    supabase.from('deposit_addresses').select('*').eq('is_active', true).order('sort_order').then(({ data }) => {
      const list = (data as Addr[]) || [];
      setAddrs(list);
      if (list.length) setSelected(list[0]);
    });
    loadDeposits();
  }, [user]);

  const copy = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.wallet_address);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !user) return;
    const amt = parseFloat(amount);
    if (!amt || amt < selected.min_deposit) {
      toast.error(`Minimum deposit is ${selected.min_deposit} ${selected.crypto_symbol}`);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('deposits').insert({
      user_id: user.id,
      crypto_symbol: selected.crypto_symbol,
      network: selected.network,
      amount: amt,
      transaction_hash: txHash || null,
      wallet_address: selected.wallet_address,
      status: 'pending',
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success('Deposit submitted! Awaiting admin approval.');
      setAmount(''); setTxHash('');
      loadDeposits();
    }
  };

  return (
    <DashboardLayout>
      <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Deposit crypto</h1>
      <p className="text-sm text-muted-foreground mb-8">Send crypto to one of our wallets and submit the transaction details below.</p>

      {addrs.length === 0 ? (
        <div className="card-premium text-center">
          <AlertCircle className="h-10 w-10 text-gold mx-auto mb-3" />
          <p className="font-medium">No deposit addresses configured yet</p>
          <p className="text-sm text-muted-foreground mt-1">The admin will add deposit wallets soon.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1fr] gap-5">
          <div className="card-premium">
            <h2 className="font-display text-lg font-semibold mb-4">1. Choose crypto</h2>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {addrs.map(a => (
                <button key={a.id} onClick={() => setSelected(a)}
                  className={`p-3 rounded-lg border text-center transition ${selected?.id === a.id ? 'border-gold bg-gold/10' : 'border-border hover:border-white/20'}`}>
                  <p className="font-bold text-sm">{a.crypto_symbol}</p>
                  <p className="text-xs text-muted-foreground">{a.network}</p>
                </button>
              ))}
            </div>

            {selected && (
              <>
                <h3 className="font-medium text-sm mb-3">2. Scan QR or copy address</h3>
                <div className="rounded-lg overflow-hidden bg-white p-4 mb-3 max-w-[220px] mx-auto flex items-center justify-center">
                  {selected.qr_image_url ? (
                    <img src={selected.qr_image_url} alt="QR" className="w-full h-auto" />
                  ) : (
                    <QRCodeSVG value={selected.wallet_address} size={180} level="M" includeMargin className="w-full h-auto" />
                  )}
                </div>
                <div className="flex gap-2">
                  <input readOnly value={selected.wallet_address}
                    className="flex-1 px-3 py-2 rounded-lg bg-input border border-border font-mono text-xs" />
                  <button onClick={copy} className="btn-outline-gold !py-2 !px-3">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Network: <span className="text-foreground">{selected.network}</span> · Min: <span className="text-foreground">{selected.min_deposit} {selected.crypto_symbol}</span>
                </p>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-200/90">
                    Send funds only on the <span className="font-semibold">{selected.network}</span> network. Wrong network transfers may result in permanent loss of funds.
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="card-premium">
            <h2 className="font-display text-lg font-semibold mb-4">3. Submit transaction</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Amount ({selected?.crypto_symbol})</label>
                <input type="number" step="any" required value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Transaction hash (TXID)</label>
                <input value={txHash} onChange={e => setTxHash(e.target.value)} placeholder="Paste your transaction hash"
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none font-mono text-xs" />
              </div>
              <button disabled={loading || !selected} className="btn-gold w-full justify-center">
                <Upload className="h-4 w-4" /> {loading ? 'Submitting...' : 'Submit deposit'}
              </button>
              <p className="text-xs text-muted-foreground text-center">Deposits are credited within 30 minutes after admin verification.</p>
            </form>
          </div>
        </div>
      )}

      <div className="card-premium mt-6">
        <h2 className="font-display text-lg font-semibold mb-4">Recent deposits</h2>
        {deposits.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No deposits yet.</p>
        ) : (
          <div className="space-y-2">
            {deposits.map(d => (
              <div key={d.id} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <div>
                  <p className="font-mono font-semibold">{d.amount} {d.crypto_symbol}</p>
                  <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  d.status === 'approved' ? 'bg-success/15 text-success' :
                  d.status === 'rejected' ? 'bg-destructive/15 text-destructive' :
                  'bg-gold/15 text-gold'
                }`}>{d.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
