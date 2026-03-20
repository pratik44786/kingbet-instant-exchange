import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import {
  Crown, LogOut, Menu, X, ChevronDown,
  BarChart3, Gamepad2, Wallet, History as HistoryIcon,
  User, Shield, Trophy, Globe, ChevronRight, Tv,
} from 'lucide-react';

const sportsSidebar = [
  { label: 'Cricket', icon: '🏏', path: '/exchange', sport: 'cricket' },
  { label: 'Football', icon: '⚽', path: '/exchange', sport: 'football' },
  { label: 'Tennis', icon: '🎾', path: '/exchange', sport: 'tennis' },
];

const topNavTabs = [
  { label: 'HOME', path: '/exchange' },
  { label: 'CRICKET', path: '/exchange?sport=cricket' },
  { label: 'FOOTBALL', path: '/exchange?sport=football' },
  { label: 'TENNIS', path: '/exchange?sport=tennis' },
  { label: 'CASINO', path: '/casino' },
  { label: 'LIVE CASINO', path: '/live-casino' },
];

const DashboardLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout: authLogout } = useAuth();
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(true);

  const handleLogout = () => {
    authLogout();
    navigate('/login');
  };

  const mainNav = [
    { label: 'Exchange', path: '/exchange', icon: BarChart3 },
    { label: 'Casino', path: '/casino', icon: Gamepad2 },
    { label: 'Live Casino', path: '/live-casino', icon: Tv },
    { label: 'Wallet', path: '/wallet', icon: Wallet },
    { label: 'History', path: '/history', icon: HistoryIcon },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  if (user?.role === 'admin' || user?.role === 'master_admin' || user?.role === 'superadmin') {
    mainNav.push({
      label: user.role === 'superadmin' ? 'Super Admin' : user.role === 'master_admin' ? 'Master Admin' : 'Admin',
      path: user.role === 'superadmin' ? '/superadmin' : '/admin',
      icon: Shield,
    });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex flex-col">
      {/* ═══ Top Header Bar ═══ */}
      <header className="h-12 bg-[#0f1829] border-b border-white/5 flex items-center justify-between px-3 lg:px-4 sticky top-0 z-50">
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden p-1.5 rounded bg-[#1e273e] text-gray-400 hover:text-white transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to="/exchange" className="flex items-center gap-1.5">
            <Crown className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-black tracking-tighter hidden sm:inline">
              KING<span className="text-yellow-500">BET</span>
            </span>
          </Link>
        </div>

        {/* Center: Quick Nav Tabs (Desktop) */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#1e273e] rounded-lg p-0.5">
          {topNavTabs.map((t) => (
            <Link
              key={t.label}
              to={t.path}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all ${
                isActive(t.path.split('?')[0]) && (t.path === '/exchange' ? location.pathname === '/exchange' : true)
                  ? 'bg-yellow-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        {/* Right: Balance + Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1e273e] rounded-lg px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5 text-yellow-500" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-gray-500 font-bold uppercase leading-none">Balance</span>
              <span className="text-xs font-black text-green-500 leading-none">{currentUser?.balance?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="font-medium truncate max-w-[80px]">{user?.username}</span>
            {user?.role !== 'user' && (
              <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1 py-0.5 rounded font-bold uppercase">{user?.role}</span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ═══ Left Sidebar ═══ */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative z-40 w-52 bg-[#0f1829] border-r border-white/5
          flex flex-col transition-transform duration-200 h-[calc(100vh-48px)]
        `}>
          {/* Main Navigation */}
          <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
            {mainNav.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive(item.path)
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}

            {/* Sports Section */}
            <div className="mt-3 pt-3 border-t border-white/5">
              <button
                onClick={() => setSportsOpen(!sportsOpen)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase"
              >
                All Sports
                <ChevronDown className={`w-3 h-3 transition-transform ${sportsOpen ? 'rotate-180' : ''}`} />
              </button>
              {sportsOpen && (
                <div className="space-y-0.5 mt-1">
                  {sportsSidebar.map((s) => (
                    <Link
                      key={s.label}
                      to={s.path}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <span className="text-sm">{s.icon}</span>
                      {s.label}
                    </Link>
                  ))}
                  {['Basketball', 'Horse Racing', 'Kabaddi', 'Volleyball', 'Table Tennis', 'Badminton', 'Boxing', 'MMA'].map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-600 cursor-not-allowed"
                    >
                      <span className="w-4 h-4 bg-[#1e273e] rounded text-[8px] flex items-center justify-center">🔒</span>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/5">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Trophy className="w-3 h-3" />
              <span>KingBet Exchange v3.0</span>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ═══ Main Content ═══ */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <Outlet />
          {children}
        </main>
      </div>

      {/* ═══ Mobile Bottom Nav ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f1829] border-t border-white/5 h-14 flex items-center justify-around z-50">
        {mainNav.slice(0, 5).map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 transition-all ${
              isActive(item.path) ? 'text-yellow-500' : 'text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default DashboardLayout;
