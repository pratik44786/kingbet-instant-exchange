import { useApp } from '@/context/AppContext';
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon } from 'lucide-react';

const WalletPage = () => {
  const { currentUser, transactions } = useApp();

  return (
    <div className="flex-1 p-4 overflow-auto max-w-3xl mx-auto w-full">
      <h2 className="text-lg font-bold text-foreground mb-4">Points Wallet</h2>

      <div className="surface-card rounded-lg p-6 mb-6 glow-gold">
        <div className="flex items-center gap-3 mb-1">
          <WalletIcon className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <p className="text-4xl font-bold font-mono gold-text">{currentUser.balance.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-1">Points • Managed by Admin</p>
      </div>

      <div className="surface-card rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="divide-y divide-border/50">
          {transactions.map(txn => (
            <div key={txn.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'credit' || txn.type === 'bet_win' ? 'bg-positive/20' : 'bg-destructive/20'}`}>
                  {txn.type === 'credit' || txn.type === 'bet_win'
                    ? <ArrowDownRight className="w-4 h-4 text-positive" />
                    : <ArrowUpRight className="w-4 h-4 text-destructive" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{txn.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(txn.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono font-semibold ${txn.type === 'credit' || txn.type === 'bet_win' ? 'text-positive' : 'text-destructive'}`}>
                  {txn.type === 'credit' || txn.type === 'bet_win' ? '+' : '-'}{txn.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{txn.balanceAfter.toLocaleString()} PTS</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
