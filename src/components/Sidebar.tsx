import { BarChart3, CircleDot, Dribbble, Dice1, Wallet, Shield, Trophy } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';

const navItems = [
  { icon: BarChart3, label: 'Exchange', path: '/' },
  { icon: CircleDot, label: 'Cricket', path: '/cricket' },
  { icon: Dribbble, label: 'Football', path: '/football' },
  { icon: Dice1, label: 'Casino', path: '/casino' },
  { icon: Wallet, label: 'Wallet', path: '/wallet' },
];

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useApp();
  const isAdmin = ['admin', 'masteradmin', 'superadmin'].includes(currentUser.role);

  return (
    <aside className="w-56 bg-sidebar border-r border-sidebar-border flex-shrink-0 hidden lg:flex flex-col">
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-primary glow-gold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className={cn("w-4 h-4", active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              location.pathname === '/admin'
                ? "bg-sidebar-accent text-sidebar-primary glow-gold"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-3 h-3" />
          <span>Points Exchange v1.0</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
