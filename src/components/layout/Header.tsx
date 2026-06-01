import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Logo from './Logo';

const nav = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/plans', label: 'Plans' },
  { to: '/referral', label: 'Referral' },
  { to: '/blog', label: 'Blog' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-white/5">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo className="h-8 w-8" />
          <span className="font-display font-bold text-lg tracking-wide">
            <span className="text-gradient-gold">KINGBET</span>
            <span className="text-foreground/90 ml-1">EXCHANGE</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-gold bg-gold/10' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn-outline-gold !py-2 !px-4 text-sm">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button
                onClick={async () => { await logout(); navigate('/'); }}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-gold transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-gold !py-2 !px-5 text-sm">Get Started</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-foreground" aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {nav.map(n => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-sm font-medium ${
                    isActive ? 'text-gold bg-gold/10' : 'text-foreground/80 hover:bg-white/5'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="h-px bg-white/5 my-2" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="btn-outline-gold w-full justify-center">Dashboard</Link>
                <button
                  onClick={async () => { await logout(); setOpen(false); navigate('/'); }}
                  className="px-4 py-3 text-sm font-medium text-destructive text-left"
                >Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline-gold w-full justify-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-gold w-full justify-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
