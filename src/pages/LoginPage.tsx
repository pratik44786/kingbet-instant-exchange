import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithUserId } = useAuth();
  const [activeTab, setActiveTab] = useState<'regular' | 'admin'>('regular');

  // Regular user login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin/SuperAdmin login (User ID only)
  const [userId, setUserId] = useState('');
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState('');

  // Get the intended destination after login
  const from = (location.state as { from?: Location })?.from?.pathname || '/';

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error('Username and password are required');
      }

      // Mock API call - replace with your actual login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();

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
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAdmin(true);
    setErrorAdmin('');

    try {
      if (!userId.trim()) {
        throw new Error('User ID is required');
      }

      // Mock API call for Admin/SuperAdmin User ID login
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim() }),
      });

      if (!response.ok) {
        throw new Error('Invalid User ID');
      }

      const data = await response.json();

      // Verify response has required role field
      if (!data.user.role || !['admin', 'superadmin'].includes(data.user.role)) {
        throw new Error('User ID does not have admin privileges');
      }

      loginWithUserId(
        userId.trim(),
        {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email || '',
          phone: data.user.phone || '',
          role: data.user.role,
          userId: userId.trim(),
          balance: data.user.balance || 0,
        },
        data.token
      );

      navigate(from, { replace: true });
    } catch (err) {
      setErrorAdmin(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white tracking-wider">KINGBET</h1>
          </div>
          <p className="text-gray-400">Welcome back</p>
        </div>

        {/* Form Card */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 sm:p-8 shadow-2xl">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'regular' | 'admin')}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700 mb-6">
              <TabsTrigger value="regular" className="text-gray-300">
                Regular Login
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-gray-300">
                Admin/SuperAdmin
              </TabsTrigger>
            </TabsList>

            {/* Regular User Login Tab */}
            <TabsContent value="regular" className="mt-0">
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegularLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                    disabled={isLoading}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* Admin/SuperAdmin Login Tab */}
            <TabsContent value="admin" className="mt-0">
              {errorAdmin && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg text-red-400 text-sm">
                  {errorAdmin}
                </div>
              )}

              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg text-yellow-200 text-xs">
                Admin and SuperAdmin users log in using their unique User ID only.
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User ID
                  </label>
                  <Input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your User ID"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500 focus:ring-yellow-500"
                    disabled={isLoadingAdmin}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Your User ID can be found in your admin dashboard or email confirmation.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoadingAdmin}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2"
                >
                  {isLoadingAdmin ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Login as Admin'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-yellow-500 hover:text-yellow-400 font-semibold transition-colors"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;      </div>
    </div>
  );
};

export default LoginPage;
