import { useApp } from '@/context/AppContext';
import { useState } from 'react';
import { History, TrendingUp, Gamepad2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Tab = 'bets' | 'transactions' | 'games';

const HistoryPage = () => {
  const { bets, transactions } = useApp();
  const [tab, setTab] = useState<Tab>('bets');

  const tabs = [
    { id: 'bets' as const, label: 'Bet History', icon: TrendingUp },
    { id: 'transactions' as const, label: 'Transactions', icon: History },
    { id: 'games' as const, label: 'Game History', icon: Gamepad2 },
  ];

  const isCredit = (type: string) => ['bet_win', 'admin_credit', 'deposit', 'bonus_credit', 'bet_refund'].includes(type);

  return (
    <div className="flex-1 p-4 overflow-auto max-w-4xl mx-auto w-full">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-primary" /> History
      </h2>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'bets' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1e273e] border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">All Bets ({bets.length})</h3>
          </div>
          <div className="divide-y divide-border/50">
            {bets.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No bets yet</p>
            ) : bets.map(bet => {
              const betLabel: Record<string, string> = {
                back: 'BACK', lay: 'LAY',
                fancy_yes: 'FANCY YES', fancy_no: 'FANCY NO',
                session_over: 'SESSION OVER', session_under: 'SESSION UNDER',
                casino: 'CASINO', crash: 'CRASH', dice: 'DICE',
                mines: 'MINES', plinko: 'PLINKO', aviator: 'AVIATOR', teen_patti: 'TEEN PATTI',
              };
              const isBack = ['back', 'fancy_yes', 'session_over'].includes(bet.bet_type);
              const label = betLabel[bet.bet_type] || bet.bet_type.toUpperCase();

              return (
                <div key={bet.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${isBack ? 'bg-[#72bbef]/20 text-[#72bbef]' : 'bg-[#faa9ba]/20 text-[#faa9ba]'}`}>
                      {label}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">@ {bet.odds}</p>
                      <p className="text-xs text-muted-foreground">{new Date(bet.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-semibold text-foreground">{bet.stake} PTS</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${bet.status === 'won' ? 'bg-green-500/20 text-green-400' : bet.status === 'lost' ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'}`}>
                      {bet.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1e273e] border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">All Transactions ({transactions.length})</h3>
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
      )}

      {tab === 'games' && (
        <div className="surface-card rounded-lg p-8 text-center">
          <Gamepad2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Game history will appear here after playing casino games.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
