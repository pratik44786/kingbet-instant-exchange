import { useState, useEffect } from 'react';
import { Shield, Plus, Minus, Users, UserPlus, Loader2, Ban, Check, Lock } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { adminService } from '@/services/bettingService';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  username: string;
  status: string;
  created_at: string;
  wallets: { balance: number; exposure: number; total_profit_loss: number }[] | null;
  user_roles: { role: string }[] | null;
}

const AdminPage = () => {
  const { currentUser } = useApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'users' | 'points' | 'create'>('users');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [transactionPin, setTransactionPin] = useState('');
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminService.listUsers();
      setUsers(res.users || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdjust = async (type: 'credit' | 'debit') => {
    if (!selectedUserId || amount <= 0) return;
    if (!transactionPin || transactionPin.length < 4) {
      toast.error('Transaction PIN is required (min 4 characters)');
      return;
    }
    try {
      const result = await adminService.adjustBalance(selectedUserId, amount, type, transactionPin);
      if (result.pin_created) toast.success('Transaction PIN set successfully!');
      toast.success(`${type === 'credit' ? 'Added' : 'Removed'} ${amount} points`);
      setAmount(0);
      setTransactionPin('');
      fetchUsers();
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
      await adminService.createUser(newUserId.trim(), newPassword.trim(), newUserId.trim(), 'user');
      toast.success(`User "${newUserId}" created!`);
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

  const tabs = [
    { id: 'users' as const, label: 'My Users', icon: Users },
    { id: 'points' as const, label: 'Top Up', icon: Plus },
    { id: 'create' as const, label: 'Create User', icon: UserPlus },
  ];

  return (
    <div className="flex-1 p-4 overflow-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="surface-card rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No users yet. Create one from the "Create User" tab.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                  <th className="text-left px-4 py-2">User ID</th>
                  <th className="text-left px-4 py-2">Status</th>
                  <th className="text-right px-4 py-2">Balance</th>
                  <th className="text-right px-4 py-2">P/L</th>
                  <th className="text-right px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {users.map((u: UserRow) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{u.username}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded uppercase font-semibold ${u.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{u.status}</span></td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm">{(u.wallets?.[0]?.balance || 0).toLocaleString()}</td>
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
          )}
        </div>
      )}

      {tab === 'points' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Adjust User Balance</h3>
          <div className="space-y-4">
            <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
              className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm border border-border">
              <option value="">Choose user...</option>
              {users.map((u: UserRow) => <option key={u.id} value={u.id}>{u.username} ({(u.wallets?.[0]?.balance || 0).toLocaleString()} PTS)</option>)}
            </select>
            <input type="number" value={amount || ''} onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
              placeholder="Amount" className="w-full bg-[#1e273e] text-foreground rounded-lg px-3 py-2 text-sm font-mono border border-border" />
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="password" value={transactionPin} onChange={e => setTransactionPin(e.target.value)}
                placeholder="Transaction PIN (first time = set PIN)" className="w-full bg-[#1e273e] text-foreground rounded-lg pl-10 pr-3 py-2 text-sm border border-border" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleAdjust('credit')} disabled={!selectedUserId || amount <= 0 || !transactionPin}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40">
                <Plus className="w-4 h-4" /> Add Points
              </button>
              <button onClick={() => handleAdjust('debit')} disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white rounded-lg py-2 text-sm font-semibold disabled:opacity-40">
                <Minus className="w-4 h-4" /> Remove Points
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Create New User</h3>
          <form onSubmit={handleCreate} className="space-y-4">
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
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm">Create User</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
