import { Crown, Wallet, ChevronDown } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const Header = () => {
  const { currentUser, users, switchUser } = useApp();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Crown className="w-7 h-7 text-primary" />
        <span className="text-lg font-bold tracking-tight gold-text">KINGBET EXCHANGE</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5">
          <Wallet className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground">
            {currentUser.balance.toLocaleString()} PTS
          </span>
        </div>

        <div className="relative group">
          <button className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-1.5 text-sm">
            <span className="text-foreground font-medium">{currentUser.username}</span>
            <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-semibold">
              {currentUser.role}
            </span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors first:rounded-t-lg last:rounded-b-lg flex justify-between"
              >
                <span className="text-foreground">{u.username}</span>
                <span className="text-xs text-muted-foreground">{u.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
