import { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { UserCircle, Camera, Loader2, Copy, BadgeCheck } from 'lucide-react';

export default function Profile() {
  const { user, refreshProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState({ full_name: '', phone: '', display_name: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, phone, display_name, avatar_url').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({ full_name: data.full_name || '', phone: data.phone || '', display_name: data.display_name || '' });
          setAvatar(data.avatar_url || null);
        }
      });
  }, [user]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      const { error: dbErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      if (dbErr) throw dbErr;
      setAvatar(publicUrl);
      toast.success('Profile photo updated');
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name || null,
      phone: form.phone || null,
      display_name: form.display_name || null,
    }).eq('id', user.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Profile updated');
    refreshProfile();
  };

  const copyRef = () => {
    if (!user?.referralCode) return;
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied');
  };

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <UserCircle className="h-6 w-6 text-gold" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="card-premium flex flex-col items-center text-center">
          <div className="relative">
            <div className="h-28 w-28 rounded-full overflow-hidden bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-16 w-16 text-gold/50" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-gradient-gold text-primary-foreground flex items-center justify-center shadow-gold"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onUpload} />
          </div>
          <p className="font-display font-semibold mt-4">{form.full_name || user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <BadgeCheck className={`h-4 w-4 ${user?.kycStatus === 'approved' ? 'text-green-400' : 'text-muted-foreground'}`} />
            <span className="capitalize text-muted-foreground">KYC: {user?.kycStatus}</span>
          </div>
          {user?.referralCode && (
            <button onClick={copyRef} className="mt-4 glass rounded-lg px-3 py-2 text-xs flex items-center gap-2 w-full justify-center">
              <span className="font-mono tracking-wider">{user.referralCode}</span>
              <Copy className="h-3.5 w-3.5 text-gold" />
            </button>
          )}
        </div>

        <div className="card-premium">
          <h2 className="font-display text-lg font-semibold mb-4">Personal information</h2>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Full name</label>
              <input className="input mt-1" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Your full name" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Display name</label>
              <input className="input mt-1" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Public display name" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Phone</label>
              <input className="input mt-1" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <input className="input mt-1 opacity-60" value={user?.email || ''} disabled />
            </div>
            <button className="btn-gold" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Save changes
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
