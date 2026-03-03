import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Crown, Loader2, User, Lock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email.trim() || !password.trim() || !username.trim()) {
        throw new Error('All fields are required');
      }
      if (password.length < 6) throw new Error('Password must be at least 6 characters');

      await register(email.trim(), password.trim(), username.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-gray-400 mb-6">Check your email to confirm your account, then log in.</p>
          <Button onClick={() => navigate('/login')} className="bg-yellow-600 hover:bg-yellow-700">Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            <h1 className="text-4xl font-black text-white tracking-tighter italic">KINGBET</h1>
          </div>
          <p className="text-gray-400 font-medium">Create Your Account</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="Choose a username" className="bg-gray-900/50 border-gray-700 pl-10 h-12 text-white" disabled={isLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="bg-gray-900/50 border-gray-700 pl-10 h-12 text-white" disabled={isLoading} required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters" className="bg-gray-900/50 border-gray-700 pl-10 h-12 text-white" disabled={isLoading} required />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}
              className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-white font-bold text-lg rounded-xl">
              {isLoading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating...</>) : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 text-center">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-gray-400 hover:text-yellow-500">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
