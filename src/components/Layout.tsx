import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  Trophy, 
  Wallet, 
  History, 
  User, 
  LogOut, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Exchange', path: '/exchange', icon: Trophy },
    { name: 'Casino', path: '/casino', icon: LayoutDashboard },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // Admin Links
  if (user?.role === 'admin' || user?.role === 'superadmin') {
    menuItems.push({ 
      name: user.role === 'superadmin' ? 'Super Admin' : 'Admin', 
      path: user.role === 'superadmin' ? '/superadmin' : '/admin', 
      icon: ShieldCheck 
    });
  }

  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-14 bg-[#1e273e] border-b border-white/5 flex items-center justify-between px-4 sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black italic text-yellow-500 tracking-tighter">KINGBET</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Balance</span>
            <span className="text-sm font-black text-green-500">pts {currentUser?.balance?.toLocaleString() || 0}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-[#161d2f] border-r border-white/5 flex-col p-4 gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                location.pathname === item.path ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <Outlet />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Diamond Style) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#1e273e] border-t border-white/10 h-16 flex items-center justify-around z-50">
        {menuItems.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-yellow-500' : 'text-gray-500'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Layout;
