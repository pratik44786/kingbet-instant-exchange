import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock, User, Phone, Tag, Eye, EyeOff } from 'lucide-react';
import Logo from '@/components/layout/Logo';
import { z } from 'zod';
import Seo from '@/components/Seo';

const schema = z.object({
  fullName: z.string().trim().min(2, 'Name is too short').max(80),
  email: z.string().trim().email('Invalid email').max(255),
  phone: z.string().trim().max(20).optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  confirm: z.string(),
  referralCode: z.string().trim().max(16).optional().or(z.literal('')),
}).refine(d => d.password === d.confirm, { path: ['confirm'], message: "Passwords don't match" });

export default function Register() {
  const { register, error } = useAuth();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirm: '', referralCode: params.get('ref') || '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrs({});
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
        fullName: form.fullName,
        phone: form.phone,
        referralCode: form.referralCode,
      });
      toast.success('Account created! Check your email to verify.');
      navigate('/login');
    } catch { /* surfaced via error */ }
    finally { setLoading(false); }
  };

  const upd = (k: string, v: string) => setForm({ ...form, [k]: v });

  return (
    <div className="min-h-screen flex flex-col">
      <Seo title="Create account | KingBet Exchange" description="Create a secure KingBet Exchange account." path="/register" noindex />
      <header className="p-5">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md card-premium">
          <div className="text-center mb-8">
            <Logo className="h-12 w-12 mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold">Create account</h1>
            <p className="text-sm text-muted-foreground mt-1">Start earning passive crypto income today</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field icon={User} label="Full name" value={form.fullName} onChange={v => upd('fullName', v)} err={errs.fullName} placeholder="John Doe" />
            <Field icon={Mail} type="email" label="Email" value={form.email} onChange={v => upd('email', v)} err={errs.email} placeholder="you@example.com" />
            <Field icon={Phone} label="Phone (optional)" value={form.phone} onChange={v => upd('phone', v)} err={errs.phone} placeholder="+91 99999 99999" />

            <div>
              <label className="text-sm font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type={show ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errs.password && <p className="text-xs text-destructive mt-1">{errs.password}</p>}
            </div>

            <Field icon={Lock} type="password" label="Confirm password" value={form.confirm} onChange={v => upd('confirm', v)} err={errs.confirm} />
            <Field icon={Tag} label="Referral code (optional)" value={form.referralCode} onChange={v => upd('referralCode', v)} err={errs.referralCode} placeholder="ABC12345" />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleSignInButton label="Sign up with Google" />


          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-gold hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, err, type = 'text', placeholder }: { icon: any; label: string; value: string; onChange: (v: string) => void; err?: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-input border border-border focus:border-gold focus:outline-none" />
      </div>
      {err && <p className="text-xs text-destructive mt-1">{err}</p>}
    </div>
  );
}
