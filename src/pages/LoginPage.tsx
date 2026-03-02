import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Crown, Loader2, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }

      // Chahe User ho, Admin ho ya SuperAdmin, sab isi service se login karenge
      const data = await authService.login(username.trim(), password.trim());

      login(
        {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role || 'user',
          balance: data.user.balance || 0,
        },
        data.token
      );

      navigate(from, { replace: true });
    } catch (err) {
      // Agar Pratik00 hai aur password match nahi ho raha, toh manual check (Testing ke liye)
      if (username === 'Pratik00' && password === 'password123') {
         login({
            id: 'super-pratik-01',
            username: 'Pratik00',
            email: 'admin@kingbet.com',
            phone: '',
            role: 'superadmin',
            balance: 1000000,
         }, 'mock-token-pratik');
         navigate(from, { replace: true });
         return;
      }
      setError(err instanceof Error ? err.message : 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            <h1 className="text-4xl font-black text-white tracking-tighter italic">KINGBET</h1>
          </div>
          <p className="text-gray-400 font-medium">Secure Access Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Username / User ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your credentials"
                  className="bg-gray-900/50 border-gray-700 pl-10 h-12 text-white focus:border-yellow-500 transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-gray-900/50 border-gray-700 pl-10 h-12 text-white focus:border-yellow-500 transition-all"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-white font-bold text-lg rounded-xl shadow-lg shadow-yellow-900/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Account'
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an ID?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
              >
                Get ID
              </button>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <p className="text-center mt-8 text-gray-600 text-xs tracking-widest uppercase">
          Protected by Enterprise Grade Encryption
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
