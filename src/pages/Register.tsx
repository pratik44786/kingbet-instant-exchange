import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Tag, ShieldCheck, Zap, BadgeCheck } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { z } from 'zod';
import Seo from '@/components/Seo';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email').max(255),
  password: z.string().min(8, 'Use at least 8 characters').max(72),
  referralCode: z.string().trim().max(16).optional().or(z.literal('')),
});

export default function Register() {
  const { register, error, isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '', referralCode: params.get('ref') || '' });
  const [showRef, setShowRef] = useState(!!params.get('ref'));
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [friendly, setFriendly] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrs({});
    setFriendly(null);
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const m: Record<string, string> = {};
      parsed.error.issues.forEach(i => { m[i.path[0] as string] = i.message; });
      setErrs(m);
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.email.split('@')[0],
        referralCode: form.referralCode,
      });
      if (isAuthenticated) {
        toast.success('Account created!');
        navigate('/dashboard');
      } else {
        setSent(true);
        toast.success('Account created! Confirm your email to sign in.');
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message.toLowerCase() : '';
      if (msg.includes('already')) setFriendly('This email is already registered. Please sign in instead.');
      else if (msg.includes('rate') || msg.includes('limit')) setFriendly('Too many attempts. Please wait a minute and try again.');
      else if (msg.includes('password')) setFriendly('Password too weak. Use 8+ characters with a number.');
      else setFriendly('Could not create the account. Please check your details and try again.');
    }
    finally { setLoading(false); }
  };

  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Seo title="Confirm your email | KingBet Exchange" description="Confirm your email to activate your KingBet Exchange account." path="/register" noindex />
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md card-premium text-center">
            <Logo className="h-12 w-12 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold">Check your inbox</h1>
            <p className="text-sm text-muted-foreground mt-2">
              We sent a confirmation link to <span className="text-foreground font-medium">{form.email}</span>.
              Click it to activate your account, then sign in.
            </p>
            <Link to="/login" className="btn-gold w-full justify-center mt-6">Go to sign in</Link>
            <p className="text-[11px] text-muted-foreground mt-4">
              Can’t find it? Check spam or promotions folder.
            </p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen flex flex-col">
      <Seo title="Create free account | KingBet Exchange" description="Open a free KingBet Exchange account in seconds and start from just $10 USDT." path="/register" noindex />
      <header className="p-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md card-premium">
          <div className="text-center mb-6">
            <Logo className="h-12 w-12 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold">Create your free account</h1>
            <p className="text-sm text-muted-foreground mt-1">Takes 30 seconds — start from just $10 USDT</p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-6 text-center">
            {[
              { icon: Zap, label: 'Instant setup' },
              { icon: ShieldCheck, label: 'Secure wallets' },
              { icon: BadgeCheck, label: 'No fees to join' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="rounded-lg bg-input/60 border border-border py-2.5 px-1">
                <Icon className="h-4 w-4 text-gold mx-auto mb-1" />
                <span className="text-[11px] text-muted-foreground leading-tight block">{label}</span>
              </div>
            ))}
          </div>

          <GoogleSignInButton label="Sign up with Google" />

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or use email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
              </div>
              {errs.email && <p className="text-xs text-destructive mt-1">{errs.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)}
                  placeholder="At least 8 characters" autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <span key={i} className={`h-1 flex-1 rounded-full ${i < strength ? (strength <= 1 ? 'bg-destructive' : strength === 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {strength <= 1 ? 'Weak password' : strength === 2 ? 'Okay — add a number or symbol' : 'Strong password'}
                  </p>
                </div>
              )}
              {errs.password && <p className="text-xs text-destructive mt-1">{errs.password}</p>}
            </div>

            {showRef ? (
              <div>
                <label className="text-sm font-medium block mb-1.5">Referral code</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={form.referralCode} onChange={e => upd('referralCode', e.target.value)} placeholder="ABC12345"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setShowRef(true)} className="text-xs text-gold hover:underline">
                Have a referral code?
              </button>
            )}

            {(friendly || error) && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5">
                <p className="text-sm text-destructive">{friendly || error}</p>
                {friendly?.includes('already registered') && (
                  <Link to="/login" className="text-xs text-gold hover:underline font-medium">Sign in to your account →</Link>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
            <p className="text-[11px] text-muted-foreground text-center">
              No deposit required to open an account. You can add your name and phone later in Profile.
            </p>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
