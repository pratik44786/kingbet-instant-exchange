import { ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Users, LogOut, TrendingUp, Menu, X, FileCheck, ShieldCheck, Shield, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const items = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
  { to: '/plans', label: 'Plans', icon: TrendingUp },
  { to: '/referral', label: 'Referral', icon: Users },
  { to: '/kyc', label: 'KYC', icon: FileCheck },
  { to: '/profile', label: 'Profile', icon: UserCircle },
  { to: '/security', label: 'Security', icon: ShieldCheck },
];
const adminItem = { to: '/admin', label: 'Admin', icon: Shield };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Side = () => (
    <aside className="flex flex-col h-full bg-card/40 backdrop-blur-xl border-r border-white/5">
      <Link to="/" className="flex items-center gap-2 p-5 border-b border-white/5">
        <Logo className="h-8 w-8" />
        <span className="font-display font-bold">
          <span className="text-gradient-gold">KINGBET</span>
        </span>
      </Link>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-gradient-gold text-primary-foreground shadow-gold' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`
            }
          >
            <it.icon className="h-4 w-4" /> {it.label}
          </NavLink>
        ))}
        {user && ['admin','master_admin','superadmin'].includes(user.role) && (
          <NavLink to={adminItem.to} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-gradient-gold text-primary-foreground shadow-gold' : 'text-gold/80 hover:bg-gold/10 hover:text-gold'
              }`
            }>
            <adminItem.icon className="h-4 w-4" /> {adminItem.label}
          </NavLink>
        )}
      </nav>
      <div className="p-3 border-t border-white/5 space-y-2">
        <div className="px-3 py-2 rounded-lg glass text-sm">
          <p className="text-xs text-muted-foreground">Signed in</p>
          <p className="font-medium truncate">{user?.fullName || user?.username}</p>
        </div>
        <button onClick={async () => { await logout(); navigate('/'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <div className="hidden lg:block sticky top-0 h-screen">
        <Side />
      </div>

      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <Link to="/" className="flex items-center gap-2"><Logo className="h-7 w-7" /><span className="font-display font-bold text-sm text-gradient-gold">KINGBET</span></Link>
        <button onClick={() => setOpen(true)} className="p-2"><Menu className="h-5 w-5" /></button>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-3 z-10 p-2 text-foreground"><X className="h-5 w-5" /></button>
            <Side />
          </div>
        </div>
      )}

      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-6 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
