import { Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginUser(username, password);
    if (success) {
      navigate('/exchange');
    } else {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="surface-card rounded-xl p-8 w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold gold-text">KINGBET EXCHANGE</span>
        </div>
        <h2 className="text-xl font-bold text-foreground text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase block mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm border border-border outline-none focus:ring-1 focus:ring-primary" placeholder="Enter username" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase block mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm border border-border outline-none focus:ring-1 focus:ring-primary" placeholder="Enter password" />
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
            Login
          </button>
        </form>
        <div className="mt-4 surface-card rounded-lg p-3 border border-border/50">
          <p className="text-[10px] text-muted-foreground uppercase font-semibold mb-1.5">Demo Accounts</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="text-foreground font-medium">superadmin</span> / super123</p>
            <p><span className="text-foreground font-medium">admin1</span> / admin123</p>
            <p><span className="text-foreground font-medium">player1</span> / user123</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          <Link to="/" className="hover:text-foreground">← Back to Home</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
