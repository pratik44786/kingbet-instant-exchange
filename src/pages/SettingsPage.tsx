import { useApp } from '@/context/AppContext';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';

const SettingsPage = () => {
  const { currentUser, logout } = useApp();

  return (
    <div className="flex-1 p-4 overflow-auto max-w-2xl mx-auto w-full">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <SettingsIcon className="w-5 h-5 text-primary" /> Settings
      </h2>

      <div className="surface-card rounded-lg p-6 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Username</p>
              <p className="text-xs text-muted-foreground">{currentUser.username}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-surface-2 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Role</p>
              <p className="text-xs text-muted-foreground uppercase">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card rounded-lg p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Actions</h3>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full p-3 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
