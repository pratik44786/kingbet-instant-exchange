import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Shield, Plus, Minus, Users, Settings } from 'lucide-react';
import { Role } from '@/types/exchange';

const AdminPage = () => {
  const { currentUser, users, addPoints, removePoints, changeRole } = useApp();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState(0);
  const [tab, setTab] = useState<'users' | 'points' | 'roles' | 'markets'>('users');

  const isAdmin = ['admin', 'masteradmin', 'superadmin'].includes(currentUser.role);
  const isMaster = ['masteradmin', 'superadmin'].includes(currentUser.role);
  const isSuper = currentUser.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="surface-card rounded-lg p-8 text-center max-w-md">
          <Shield className="w-12 h-12 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1">Admin privileges required</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'users' as const, label: 'Users', icon: Users },
    { id: 'points' as const, label: 'Points', icon: Plus },
    ...(isMaster ? [{ id: 'roles' as const, label: 'Roles', icon: Settings }] : []),
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

  const availableRoles: Role[] = isSuper
    ? ['user', 'admin', 'masteradmin']
    : isMaster
    ? ['user', 'admin']
    : [];

  return (
    <div className="flex-1 p-4 overflow-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded font-semibold uppercase">
          {currentUser.role}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-surface-3'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === 'users' && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">All Users</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-right px-4 py-2">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-surface-2/50">
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{u.username}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs px-2 py-0.5 rounded bg-secondary text-secondary-foreground uppercase font-semibold">{u.role}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm text-foreground">{u.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Points Tab */}
      {tab === 'points' && (
        <div className="surface-card rounded-lg p-6 max-w-md">
          <h3 className="text-sm font-semibold text-foreground mb-4">Manage Points</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm border border-border outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Choose user...</option>
                {users.filter(u => u.role === 'user').map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.balance.toLocaleString()} PTS)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase mb-1 block">Amount</label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                placeholder="Enter points"
                className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2 text-sm font-mono border border-border outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddPoints}
                disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-positive text-positive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Add Points
              </button>
              <button
                onClick={handleRemovePoints}
                disabled={!selectedUserId || amount <= 0}
                className="flex-1 flex items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-lg py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" /> Remove Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {tab === 'roles' && isMaster && (
        <div className="surface-card rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 bg-surface-2 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Role Management</h3>
          </div>
          <div className="divide-y divide-border/50">
            {users.filter(u => u.id !== currentUser.id).map(u => (
              <div key={u.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.username}</p>
                  <p className="text-xs text-muted-foreground">Current: {u.role}</p>
                </div>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value as Role)}
                  className="bg-surface-2 text-foreground rounded px-3 py-1.5 text-sm border border-border outline-none"
                >
                  {availableRoles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
