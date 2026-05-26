const coins = [
  { s: 'BTC', p: 67234.50, c: 2.4 },
  { s: 'ETH', p: 3489.21, c: 1.8 },
  { s: 'BNB', p: 612.45, c: -0.6 },
  { s: 'SOL', p: 178.92, c: 5.2 },
  { s: 'USDT', p: 1.0001, c: 0.01 },
  { s: 'XRP', p: 0.62, c: -1.3 },
  { s: 'ADA', p: 0.48, c: 3.1 },
  { s: 'DOGE', p: 0.16, c: 4.7 },
  { s: 'TRX', p: 0.14, c: 0.9 },
  { s: 'MATIC', p: 0.72, c: -2.1 },
];

export default function MarketTicker() {
  const items = [...coins, ...coins];
  return (
    <div className="border-y border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {items.map((c, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 text-sm">
            <span className="font-mono font-semibold text-foreground">{c.s}</span>
            <span className="text-muted-foreground">${c.p.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            <span className={c.c >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
              {c.c >= 0 ? '+' : ''}{c.c.toFixed(2)}%
            </span>
            <span className="text-white/10">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
