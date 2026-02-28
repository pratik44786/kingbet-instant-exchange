import { Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login — go to exchange
    navigate('/exchange');
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
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm border border-border outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter username"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-2 text-foreground rounded-lg px-3 py-2.5 text-sm border border-border outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter password"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity">
            Login
          </button>
        </form>
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
