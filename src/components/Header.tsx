import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { Crown, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { handleLogout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate('/')}
          >
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white tracking-wider hidden sm:block">
              KINGBET
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 flex-1 justify-center mx-8">
            <button
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-yellow-500 font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigate('/exchange')}
              className="text-gray-300 hover:text-yellow-500 font-medium transition-colors"
            >
              Exchange
            </button>
            <button
              onClick={() => navigate('/casino')}
              className="text-gray-300 hover:text-yellow-500 font-medium transition-colors"
            >
              Casino
            </button>
            <button
              onClick={() => navigate('/aviator')}
              className="text-gray-300 hover:text-yellow-500 font-medium transition-colors"
            >
              Aviator
            </button>
            <button
              onClick={() => navigate('/plinko')}
              className="text-gray-300 hover:text-yellow-500 font-medium transition-colors"
            >
              Plinko
            </button>
          </nav>

          {/* Right Section - Auth Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {/* Desktop View - User Menu Dropdown */}
                <div className="hidden md:flex items-center gap-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-yellow-500"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {user?.name || 'User'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-gray-800 border-gray-700"
                    >
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-semibold text-gray-200">
                          {user?.name}
                        </p>
                        {user?.email && (
                          <p className="text-xs text-gray-400">{user.email}</p>
                        )}
                      </div>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={() => navigate('/profile')}
                        className="text-gray-300 hover:text-yellow-500 cursor-pointer"
                      >
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigate('/settings')}
                        className="text-gray-300 hover:text-yellow-500 cursor-pointer"
                      >
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-500 hover:bg-red-900/20 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
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
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Not Authenticated - Login/Register Buttons */}
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="hidden sm:inline-flex bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-yellow-500"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Register
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-300" />
              ) : (
                <Menu className="w-6 h-6 text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-gray-700">
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-800"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate('/exchange');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-800"
            >
              Exchange
            </button>
            <button
              onClick={() => {
                navigate('/casino');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-800"
            >
              Casino
            </button>
            <button
              onClick={() => {
                navigate('/aviator');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-800"
            >
              Aviator
            </button>
            <button
              onClick={() => {
                navigate('/plinko');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-300 hover:text-yellow-500 hover:bg-gray-800"
            >
              Plinko
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
