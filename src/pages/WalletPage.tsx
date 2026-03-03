import { useApp } from '@/context/AppContext';
import { ArrowUpRight, ArrowDownRight, Wallet as WalletIcon } from 'lucide-react';

const WalletPage = () => {
  const { currentUser, wallet, transactions } = useApp();

  const isCredit = (type: string) => ['bet_win', 'admin_credit', 'deposit', 'bonus_credit', 'bet_refund'].includes(type);

  return (
    <div className="flex-1 p-4 overflow-auto max-w-3xl mx-auto w-full">
      <h2 className="text-lg font-bold text-foreground mb-4">Points Wallet</h2>

      <div className="surface-card rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <WalletIcon className="w-6 h-6 text-primary" />
          <span className="text-sm text-muted-foreground">Available Balance</span>
        </div>
        <p className="text-4xl font-bold font-mono text-yellow-400">{currentUser.available.toLocaleString()}</p>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          <span>Balance: {currentUser.balance.toLocaleString()}</span>
          <span>Exposure: <span className="text-red-400">{currentUser.exposure.toLocaleString()}</span></span>
        </div>
      </div>

      <div className="surface-card rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-[#1e273e] border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Transaction History</h3>
        </div>
        <div className="divide-y divide-border/50">
          {transactions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No transactions yet</p>
          ) : transactions.map(txn => (
            <div key={txn.id} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCredit(txn.type) ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {isCredit(txn.type) ? <ArrowDownRight className="w-4 h-4 text-green-400" /> : <ArrowUpRight className="w-4 h-4 text-red-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{txn.description || txn.type}</p>
                  <p className="text-xs text-muted-foreground">{new Date(txn.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-mono font-semibold ${isCredit(txn.type) ? 'text-green-400' : 'text-red-400'}`}>
                  {isCredit(txn.type) ? '+' : '-'}{txn.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-mono">{txn.balance_after.toLocaleString()} PTS</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
