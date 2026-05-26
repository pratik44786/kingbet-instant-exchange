import { Link } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { setSent(true); toast.success('Password reset email sent'); }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-5">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md card-premium">
          <div className="text-center mb-8">
            <Logo className="h-12 w-12 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mt-1">We'll email you a reset link.</p>
          </div>

          {sent ? (
            <div className="text-center py-6">
              <Mail className="h-10 w-10 text-gold mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Check your inbox at <span className="text-foreground font-medium">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
              </div>
              <button disabled={loading} className="btn-gold w-full justify-center">
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
