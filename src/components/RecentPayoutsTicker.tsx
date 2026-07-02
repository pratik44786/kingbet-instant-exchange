import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ArrowUpRight } from 'lucide-react';

interface Payout {
  masked_name: string;
  amount: number;
  crypto_symbol: string;
  paid_at: string | null;
}

// Demo payouts shown until real approved payouts exist.
const DEMO: Payout[] = [
  { masked_name: 'M***', amount: 1240, crypto_symbol: 'USDT', paid_at: null },
  { masked_name: 'A***', amount: 860, crypto_symbol: 'BTC', paid_at: null },
  { masked_name: 'S***', amount: 3200, crypto_symbol: 'USDC', paid_at: null },
  { masked_name: 'R***', amount: 540, crypto_symbol: 'ETH', paid_at: null },
  { masked_name: 'J***', amount: 1975, crypto_symbol: 'USDT', paid_at: null },
  { masked_name: 'K***', amount: 720, crypto_symbol: 'SOL', paid_at: null },
  { masked_name: 'D***', amount: 4100, crypto_symbol: 'USDC', paid_at: null },
  { masked_name: 'L***', amount: 615, crypto_symbol: 'BTC', paid_at: null },
];

function timeAgo(iso: string | null) {
  if (!iso) return 'just now';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RecentPayoutsTicker() {
  const [payouts, setPayouts] = useState<Payout[]>(DEMO);

  useEffect(() => {
    supabase.rpc('get_recent_payouts', { _limit: 12 }).then(({ data }) => {
      const rows = (data as Payout[]) || [];
      if (rows.length > 0) setPayouts(rows.map(r => ({ ...r, amount: Number(r.amount) })));
    });
  }, []);

  const loop = [...payouts, ...payouts];

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-glow-pulse" />
            Recent Payouts
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Live withdrawals processed for our investors</p>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-card/30 backdrop-blur-xl py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="flex gap-3 w-max animate-marquee hover:[animation-play-state:paused]">
          {loop.map((p, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg glass shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  {p.masked_name} withdrew{' '}
                  <span className="text-success font-bold font-mono">
                    ${p.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">{p.crypto_symbol} · {timeAgo(p.paid_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
