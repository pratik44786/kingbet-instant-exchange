import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ShieldCheck, KeyRound, Smartphone, LogOut, Trash2 } from 'lucide-react';

export default function Security() {
  const { user, logout } = useAuth();
  const [factors, setFactors] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  const load = async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp || []);
  };
  useEffect(() => { load(); }, []);

  const beginEnroll = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'KINGBET TOTP' });
    if (error) return toast.error(error.message);
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async () => {
    if (!enrolling) return;
    const ch = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (ch.error) return toast.error(ch.error.message);
    const v = await supabase.auth.mfa.verify({ factorId: enrolling.id, challengeId: ch.data.id, code });
    if (v.error) return toast.error(v.error.message);
    await supabase.from('profiles').update({ two_fa_enabled: true }).eq('id', user!.id);
    toast.success('2FA enabled');
    setEnrolling(null); setCode(''); load();
  };

  const disable = async (id: string) => {
    if (!confirm('Disable 2FA?')) return;
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id });
    if (error) return toast.error(error.message);
    await supabase.from('profiles').update({ two_fa_enabled: false }).eq('id', user!.id);
    toast.success('2FA disabled'); load();
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return toast.error('Password must be at least 8 characters');
    if (pw.next !== pw.confirm) return toast.error('Passwords do not match');
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    if (error) return toast.error(error.message);
    toast.success('Password updated');
    setPw({ current: '', next: '', confirm: '' });
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="h-6 w-6 text-gold" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Security</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card-premium">
          <div className="flex items-center gap-2 mb-3"><Smartphone className="h-5 w-5 text-gold" /><h2 className="font-display text-lg font-semibold">Two-factor authentication</h2></div>
          <p className="text-sm text-muted-foreground mb-4">Use an authenticator app (Google Authenticator, Authy, 1Password) for an extra layer of security.</p>

          {factors.length > 0 ? (
            <div className="space-y-2">
              {factors.map(f => (
                <div key={f.id} className="glass rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{f.friendly_name || 'Authenticator'}</p>
                    <p className="text-xs text-muted-foreground">{f.status === 'verified' ? 'Active' : 'Pending'}</p>
                  </div>
                  <button onClick={() => disable(f.id)} className="btn-icon-danger"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          ) : enrolling ? (
            <div className="space-y-3">
              <div className="glass rounded-xl p-4 flex flex-col items-center">
                <img src={enrolling.qr} alt="qr" className="w-44 h-44 rounded bg-white p-2" />
                <p className="text-[10px] font-mono mt-2 break-all text-muted-foreground">{enrolling.secret}</p>
              </div>
              <input className="input text-center font-mono tracking-widest text-lg" placeholder="123456" maxLength={6} value={code} onChange={e => setCode(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={verify} className="btn-gold flex-1">Verify & enable</button>
                <button onClick={() => setEnrolling(null)} className="btn-outline-gold flex-1">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={beginEnroll} className="btn-gold w-full">Enable 2FA</button>
          )}
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-2 mb-3"><KeyRound className="h-5 w-5 text-gold" /><h2 className="font-display text-lg font-semibold">Change password</h2></div>
          <form onSubmit={changePassword} className="space-y-3">
            <input className="input" type="password" placeholder="New password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} />
            <input className="input" type="password" placeholder="Confirm new password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} />
            <button className="btn-gold w-full">Update password</button>
          </form>
        </div>

        <div className="card-premium lg:col-span-2">
          <h2 className="font-display text-lg font-semibold mb-2">Account session</h2>
          <p className="text-sm text-muted-foreground mb-4">Signed in as {user?.email}</p>
          <button onClick={logout} className="btn-outline-gold !border-destructive/40 !text-destructive"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </div>
    </DashboardLayout>
  );
}
