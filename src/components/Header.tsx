import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLogout } from '@/hooks/useLogout';
import { useHasRole } from '@/hooks/useAuthUser';
import { Crown, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Exchange', path: '/exchange' },
  { label: 'Casino', path: '/casino' },
  { label: 'Wallet', path: '/wallet' },
  { label: 'History', path: '/history' },
];

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { handleLogout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isAdmin = useHasRole('admin');
  const isSuperAdmin = useHasRole('superadmin');

  // Determine which nav items to show based on user role
  const getNavItems = () => {
    const items = [...navItems];
    if (isAdmin) {
      items.push({ label: 'Admin', path: '/admin' });
    }
    if (isSuperAdmin) {
      items.push({ label: 'Super Admin', path: '/superadmin' });
    }
    return items;
  };

  const visibleNavItems = getNavItems();

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            aria-label="Go to home"
          >
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white tracking-wider hidden sm:block">
              KINGBET
            </h1>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center mx-8">
              {visibleNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'text-yellow-500'
                      : 'text-gray-300 hover:text-yellow-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Section - Auth Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && user ? (
              <>
                {/* Desktop View - User Menu Dropdown */}
                <div className="hidden md:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-yellow-500 flex items-center gap-2"
                      >
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="truncate max-w-[120px]">{user.username}</span>
                        {user.role !== 'user' && (
                          <span className="text-xs bg-yellow-600 text-white px-2 py-0.5 rounded whitespace-nowrap">
                            {user.role.toUpperCase()}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-gray-800 border-gray-700"
                    >
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-semibold text-gray-200 truncate">
                          {user.username}
                        </p>
                        {user.email && (
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        )}
                        {user.role !== 'user' && (
                          <p className="text-xs text-yellow-400 mt-1">
                            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </p>
                        )}
                        {user.balance !== undefined && (
                          <p className="text-xs text-green-400 mt-1">
                            Balance: {user.balance.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="text-gray-300 hover:text-yellow-500 hover:bg-gray-700 cursor-pointer"
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('/settings')}
                        className="text-gray-300 hover:text-yellow-500 hover:bg-gray-700 cursor-pointer"
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-500 hover:bg-red-900/20 cursor-pointer flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile View - Logout Button */}
                <div className="md:hidden">
                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 px-2 sm:px-3"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs hidden xs:inline">Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Not Authenticated - Login/Get ID Buttons */}
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="hidden sm:inline-flex bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-yellow-500"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm sm:text-base"
                >
                  Get ID
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            {isAuthenticated && (
              <button
                className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <nav className="md:hidden pb-4 border-t border-gray-700 bg-gray-800 animate-in fade-in">
            {visibleNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`block w-full text-left px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'text-yellow-500 bg-gray-700'
                    : 'text-gray-300 hover:text-yellow-500 hover:bg-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
