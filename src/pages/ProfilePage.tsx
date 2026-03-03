import { useApp } from '@/context/AppContext';
import { User, Settings, Mail, Phone, Shield, TrendingUp, TrendingDown, Wallet as WalletIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const ProfilePage = () => {
  const { currentUser, wallet } = useApp();
  const { user } = useAuth();

  return (
    <div className="flex-1 p-4 overflow-auto max-w-2xl mx-auto w-full">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" /> Profile
      </h2>

      <div className="surface-card rounded-lg p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{currentUser.username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs uppercase font-semibold text-muted-foreground">{currentUser.role}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">Username</p><p className="text-sm font-medium text-foreground">{currentUser.username}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">Email</p><p className="text-sm font-medium text-foreground">{user?.email || '—'}</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <WalletIcon className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">Balance</p><p className="text-sm font-mono font-bold text-yellow-400">{currentUser.balance.toLocaleString()} PTS</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">Exposure</p><p className="text-sm font-mono text-red-400">{currentUser.exposure.toLocaleString()} PTS</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">Total P/L</p><p className={`text-sm font-mono font-bold ${(wallet.wallet?.total_profit_loss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{(wallet.wallet?.total_profit_loss || 0).toLocaleString()} PTS</p></div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-[#1e273e] rounded-lg">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground uppercase">User ID</p><p className="text-sm font-mono text-foreground text-xs">{currentUser.id}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
