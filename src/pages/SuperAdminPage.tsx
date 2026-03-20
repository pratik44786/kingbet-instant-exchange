import { useState, useEffect } from 'react';
import { Shield, Plus, Minus, Users, UserPlus, BarChart3, Ban, Check, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { adminService } from '@/services/bettingService';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  username: string;
  status: string;
  parent_id: string | null;
  created_at: string;
  wallets: { balance: number; bonus_balance: number; exposure: number; total_profit_loss: number }[] | null;
  user_roles: { role: string }[] | null;
}

const SuperAdminPage = () => {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'create' | 'topup' | 'reports'>('users');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'master_admin' | 'user'>('admin');
  const [summary, setSummary] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      const res = await adminService.listUsers();
      setUsers(res.users || []);
    } catch { /* */ }
    setLoading(false);
  };

  const fetchSummary = async () => {
    try {
      const res = await adminService.platformSummary();
      setSummary(res);
    } catch { /* */ }
  };

  useEffect(() => { fetchUsers(); fetchSummary(); }, []);

  const handleAdjust = async (type: 'credit' | 'debit') => {
    if (!selectedUserId || amount <= 0) return;
    try {
      await adminService.adjustBalance(selectedUserId, amount, type);
      toast.success(`${type === 'credit' ? 'Added' : 'Removed'} ${amount} points`);
      setAmount(0);
      fetchUsers(); fetchSummary();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserId.trim() || !newPassword.trim()) {
      toast.error('User ID and password are required');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await adminService.createUser(newUserId.trim(), newPassword.trim(), newUserId.trim(), newRole);
      toast.success(`${newRole} "${newUserId}" created!`);
      setNewUserId('');
      setNewPassword('');
      fetchUsers();
    } catch (err: any) { toast.error(err.message); }
  };

  const handleBlock = async (userId: string) => {
    try { await adminService.blockUser(userId); toast.success('User blocked'); fetchUsers(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handleUnblock = async (userId: string) => {
    try { await adminService.unblockUser(userId); toast.success('User unblocked'); fetchUsers(); }
    catch (err: any) { toast.error(err.message); }
  };

  const handlePnlReport = async (period: string) => {
    try { const res = await adminService.pnlReport(period); setPnl(res); }
    catch { /* */ }
  };

  const tabs = [
    { id: 'users' as const, label: 'All Users', icon: Users },
    { id: 'create' as const, label: 'Create Account', icon: UserPlus },
    { id: 'topup' as const, label: 'Top Up', icon: Plus },
    { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="flex-1 p-4 overflow-auto max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Super Admin Panel</h2>
        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold uppercase">superadmin</span>
      </div>

      {/* Platform Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Balance', value: summary.total_balance?.toLocaleString() || '0', color: 'text-yellow-400' },
            { label: 'Total Exposure', value: summary.total_exposure?.toLocaleString() || '0', color: 'text-red-400' },
            { label: 'Active Bets', value: summary.active_bets || 0, color: 'text-blue-400' },
            { label: 'Platform P/L', value: summary.total_pnl?.toLocaleString() || '0', color: summary.total_pnl >= 0 ? 'text-green-400' : 'text-red-400' },
          ].map(c => (
            <div key={c.label} className="surface-card rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase">{c.label}</p>
              <p className={`text-xl font-mono font-bold ${c.color}`}>{c.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="surface-card rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                    <th className="text-left px-4 py-2">User ID</th>
                    <th className="text-left px-4 py-2">Role</th>
                    <th className="text-left px-4 py-2">Status</th>
                    <th className="text-right px-4 py-2">Balance</th>
                    <th className="text-right px-4 py-2">Exposure</th>
                    <th className="text-right px-4 py-2">P/L</th>
                    <th className="text-right px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((u: UserRow) => (
                    <tr key={u.id} className="hover:bg-white/5">
                      <td className="px-4 py-2.5 text-sm font-medium text-foreground">{u.username}</td>
                      <td className="px-4 py-2.5"><span className="text-xs px-2 py-0.5 rounded bg-secondary uppercase font-semibold">{u.user_roles?.[0]?.role || 'user'}</span></td>
                      <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.status}</span></td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{(u.wallets?.[0]?.balance || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm text-red-400">{(u.wallets?.[0]?.exposure || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm">{(u.wallets?.[0]?.total_profit_loss || 0).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        {u.status === 'active' ? (
                          <button onClick={() => handleBlock(u.id)} className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded hover:bg-red-500/30"><Ban className="w-3 h-3 inline mr-1" />Block</button>
                        ) : (
                          <button onClick={() => handleUnblock(u.id)} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/30"><Check className="w-3 h-3 inline mr-1" />Unblock</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'create' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Create Account</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Account Type</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'master_admin' | 'user')}
                className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm border border-border">
                <option value="admin">Admin</option>
                <option value="master_admin">Master Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">User ID</label>
              <input type="text" value={newUserId} onChange={e => setNewUserId(e.target.value)}
                className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm border border-border" placeholder="Enter unique user ID" required />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm border border-border" placeholder="Min 6 characters" required />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Create {newRole}</button>
          </form>
        </div>
      )}

      {tab === 'topup' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Up Balance</h3>
          <div className="space-y-4">
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
              className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm border border-border">
              <option value="">Choose account...</option>
              {users.map((u: UserRow) => <option key={u.id} value={u.id}>{u.username} ({(u.wallets?.[0]?.balance || 0).toLocaleString()} PTS)</option>)}
            </select>
            <input type="number" value={amount || ''} onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Amount" className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm font-mono border border-border" />
            <div className="flex gap-2">
              <button onClick={() => handleAdjust('credit')} disabled={!selectedUserId || amount <= 0}
                className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"><Plus className="w-4 h-4 inline mr-1" />Add</button>
              <button onClick={() => handleAdjust('debit')} disabled={!selectedUserId || amount <= 0}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40"><Minus className="w-4 h-4 inline mr-1" />Remove</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['daily', 'weekly', 'monthly', 'all'].map(p => (
              <button key={p} onClick={() => handlePnlReport(p)}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium capitalize hover:bg-primary hover:text-primary-foreground transition-colors">{p}</button>
            ))}
          </div>
          {pnl && (
            <div className="surface-card rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div><p className="text-xs text-muted-foreground">Total Credit</p><p className="text-lg font-mono text-green-400">+{pnl.total_credit?.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Debit</p><p className="text-lg font-mono text-red-400">-{pnl.total_debit?.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Net P/L</p><p className={`text-lg font-mono ${pnl.net_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pnl.net_pnl?.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Transactions</p><p className="text-lg font-mono text-foreground">{pnl.transaction_count}</p></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
