import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, Plus, Minus, Users, UserPlus } from 'lucide-react';

const AdminPage = () => {
  const { currentUser, users, addPoints, removePoints, createUser, getDownlineUsers } = useApp();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [tab, setTab] = useState<'users' | 'points' | 'create'>('users');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [createMsg, setCreateMsg] = useState('');

  const isAdmin = currentUser.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="surface-card rounded-lg p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {currentUser.role === 'superadmin' ? 'Please use the Super Admin panel instead.' : 'Admin privileges required'}
          </p>
        </div>
      </div>
    );
  }

  // Admin can only see their downline users
  const myUsers = getDownlineUsers(currentUser.id);

  const tabs = [
    { id: 'users' as const, label: 'My Users', icon: Users },
    { id: 'points' as const, label: 'Top Up', icon: Plus },
    { id: 'create' as const, label: 'Create User', icon: UserPlus },
  ];

  const handleAddPoints = () => {
    if (selectedUserId && amount > 0) {
      addPoints(selectedUserId, amount);
      setAmount(0);
    }
  };

  const handleRemovePoints = () => {
    if (selectedUserId && amount > 0) {
      removePoints(selectedUserId, amount);
      setAmount(0);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    const result = createUser(newUsername, newPassword, 'user', currentUser.id);
    if (result) {
      setCreateMsg(`User "${result.username}" created successfully!`);
      setNewUsername('');
      setNewPassword('');
    } else {
      setCreateMsg('Username already taken.');
    }
    setTimeout(() => setCreateMsg(''), 3000);
  };

  return (
    <div className="flex-1 p-4 overflow-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold uppercase">admin</span>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-3'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">My Downline Users ({myUsers.length})</h3>
          </div>
          {myUsers.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No users created yet</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                  <th className="text-left px-4 py-2">Username</th>
                  <th className="text-left px-4 py-2">Role</th>
                  <th className="text-right px-4 py-2">Balance</th>
                  <th className="text-right px-4 py-2">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {myUsers.map(u => (
                  <tr key={u.id} className="hover:bg-surface-2/50">
                    <td className="px-4 py-2.5 text-sm font-medium text-foreground">{u.username}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground uppercase font-semibold">{u.role}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-sm text-foreground">{u.balance.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'points' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Up User Balance</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Select User (your downline only)</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary">
                <option value="">Choose user...</option>
                {myUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.balance.toLocaleString()} PTS)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Amount</label>
              <input type="number" value={amount || ''} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                placeholder="Enter points" className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddPoints} disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-positive text-positive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={handleRemovePoints} disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                <Minus className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Create New User</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Username</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary" placeholder="Enter username" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary" placeholder="Enter password" />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
              Create User
            </button>
            {createMsg && <p className={`text-xs text-center ${createMsg.includes('success') ? 'text-positive' : 'text-destructive'}`}>{createMsg}</p>}
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
