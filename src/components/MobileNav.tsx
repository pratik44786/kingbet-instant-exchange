import { BarChart3, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { label: 'Exchange', path: '/', icon: '📊' },
  { label: 'Cricket', path: '/cricket', icon: '🏏' },
  { label: 'Football', path: '/football', icon: '⚽' },
  { label: 'Casino', path: '/casino', icon: '🎰' },
  { label: 'Wallet', path: '/wallet', icon: '💰' },
  { label: 'Admin', path: '/admin', icon: '🛡️' },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useApp();
  const isAdmin = ['admin', 'masteradmin', 'superadmin'].includes(currentUser.role);

  const items = isAdmin ? mobileNavItems : mobileNavItems.filter(i => i.path !== '/admin');

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(!open)} className="text-foreground p-2">
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
      {open && (
        <div className="absolute top-14 left-0 right-0 bg-card border-b border-border z-50 animate-slide-up">
          {items.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm border-b border-border/50",
                location.pathname === item.path ? "text-primary bg-surface-2" : "text-foreground"
              )}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileNav;
