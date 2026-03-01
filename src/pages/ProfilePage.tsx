import { useApp } from '@/context/AppContext';
import { User, Settings, Mail, Phone, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser } = useApp();

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
              <span className="text-xs uppercase font-semibold text-muted-foreground">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Username</p>
              <p className="text-sm font-medium text-foreground">{currentUser.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">User ID</p>
              <p className="text-sm font-mono text-foreground">{currentUser.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Balance</p>
              <p className="text-sm font-mono font-bold gold-text">
                {currentUser.balance.toLocaleString()} PTS
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-2 rounded-lg">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground uppercase">Member Since</p>
              <p className="text-sm text-foreground">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
