import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, Plus, Minus, Users, UserPlus, Network, ChevronRight } from 'lucide-react';
import { Role } from '@/types/exchange';

const SuperAdminPage = () => {
  const { currentUser, users, addPoints, removePoints, createUser, changeRole } = useApp();
  const [tab, setTab] = useState<'users' | 'admins' | 'create' | 'topup' | 'hierarchy'>('users');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('admin');
  const [createMsg, setCreateMsg] = useState('');

  if (currentUser.role !== 'superadmin') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="surface-card rounded-lg p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">Super Admin privileges required</p>
        </div>
      </div>
    );
  }

  const allAdmins = users.filter(u => u.role === 'admin');
  const allUsers = users.filter(u => u.role === 'user');

  const tabs = [
    { id: 'users' as const, label: 'All Users', icon: Users },
    { id: 'admins' as const, label: 'All Admins', icon: Shield },
    { id: 'create' as const, label: 'Create Account', icon: UserPlus },
    { id: 'topup' as const, label: 'Top Up', icon: Plus },
    { id: 'hierarchy' as const, label: 'Hierarchy', icon: Network },
  ];

  const handleAdd = () => { if (selectedUserId && amount > 0) { addPoints(selectedUserId, amount); setAmount(0); } };
  const handleRemove = () => { if (selectedUserId && amount > 0) { removePoints(selectedUserId, amount); setAmount(0); } };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;
    const result = createUser(newUsername, newPassword, newRole, currentUser.id);
    if (result) {
      setCreateMsg(`${newRole} "${result.username}" created!`);
      setNewUsername('');
      setNewPassword('');
    } else {
      setCreateMsg('Username already taken.');
    }
    setTimeout(() => setCreateMsg(''), 3000);
  };

  // Build hierarchy tree
  const buildTree = () => {
    const root = currentUser;
    const getChildren = (parentId: string) => users.filter(u => u.parentId === parentId);

    const renderNode = (user: typeof root, depth: number) => {
      const children = getChildren(user.id);
      const roleColor = user.role === 'superadmin' ? 'text-primary' : user.role === 'admin' ? 'text-accent' : 'text-foreground';
      return (
        <div key={user.id} className="mb-1" style={{ marginLeft: depth * 24 }}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
            {children.length > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            {children.length === 0 && <div className="w-3" />}
            <span className={`text-sm font-medium ${roleColor}`}>{user.username}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground uppercase font-semibold">{user.role}</span>
            <span className="text-xs font-mono text-muted-foreground">{user.balance.toLocaleString()} PTS</span>
          </div>
          {children.map(child => renderNode(child, depth + 1))}
        </div>
      );
    };

    return renderNode(root, 0);
  };

  return (
    <div className="flex-1 p-4 overflow-auto max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Super Admin Panel</h2>
        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold uppercase">superadmin</span>
      </div>

      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-3'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">All Users ({allUsers.length})</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Parent</th>
                <th className="text-right px-4 py-2">Balance</th>
                <th className="text-right px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{u.username}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{users.find(p => p.id === u.parentId)?.username || '—'}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-foreground">{u.balance.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'admins' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">All Admins ({allAdmins.length})</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-right px-4 py-2">Balance</th>
                <th className="text-left px-4 py-2">Downline</th>
                <th className="text-right px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {allAdmins.map(a => (
                <tr key={a.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{a.username}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-foreground">{a.balance.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{users.filter(u => u.parentId === a.id).length} users</td>
                  <td className="px-4 py-2.5 text-right text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'create' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Create Account</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Role</label>
              <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'user')}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary">
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
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
              Create {newRole === 'admin' ? 'Admin' : 'User'}
            </button>
            {createMsg && <p className={`text-xs text-center ${createMsg.includes('created') ? 'text-positive' : 'text-destructive'}`}>{createMsg}</p>}
          </form>
        </div>
      )}

      {tab === 'topup' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Up Balance</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Select Account</label>
              <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary">
                <option value="">Choose account...</option>
                <optgroup label="Admins">
                  {allAdmins.map(u => <option key={u.id} value={u.id}>{u.username} ({u.balance.toLocaleString()} PTS)</option>)}
                </optgroup>
                <optgroup label="Users">
                  {allUsers.map(u => <option key={u.id} value={u.id}>{u.username} ({u.balance.toLocaleString()} PTS)</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Amount</label>
              <input type="number" value={amount || ''} onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
                placeholder="Enter points" className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-positive text-positive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                <Plus className="w-4 h-4" /> Add
              </button>
              <button onClick={handleRemove} disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                <Minus className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'hierarchy' && (
        <div className="surface-card rounded-lg p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Account Hierarchy Tree</h3>
          <div className="font-mono text-sm">{buildTree()}</div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
