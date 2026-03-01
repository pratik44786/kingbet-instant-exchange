import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, LogOut } from 'lucide-react';

interface HeaderProps {
  isAuthenticated?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAuthenticated = false,
  userName = 'User',
  onLogout,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');

    // Call custom logout handler if provided
    if (onLogout) {
      onLogout();
    }

    // Redirect to login or home
    navigate('/login');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white tracking-wider">
              KINGBET EXCHANGE
            </h1>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>

          {/* Right Section - Logout Button */}
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <div className="text-gray-300">
                <p className="text-sm">Welcome, <span className="font-semibold text-yellow-500">{userName}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
