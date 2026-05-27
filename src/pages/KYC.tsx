import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileCheck, Upload, ShieldCheck, Clock, XCircle } from 'lucide-react';

type Status = 'pending' | 'approved' | 'rejected' | 'none';

export default function KYC() {
  const { user, refreshProfile } = useAuth();
  const [status, setStatus] = useState<Status>('none');
  const [latest, setLatest] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: '', document_type: 'passport', document_number: '', country: '' });
  const [files, setFiles] = useState<{ front?: File; back?: File; selfie?: File }>({});

  useEffect(() => {
    if (!user) return;
    supabase.from('kyc_submissions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { setLatest(data); setStatus((data?.status as Status) || 'none'); });
  }, [user]);

  const upload = async (file: File, kind: string) => {
    const path = `${user!.id}/${Date.now()}-${kind}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error } = await supabase.storage.from('kyc-docs').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('kyc-docs').createSignedUrl ? await supabase.storage.from('kyc-docs').createSignedUrl(path, 60 * 60 * 24 * 365 * 5) : { data: null };
    return data?.signedUrl || path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_name || !form.document_number || !files.front || !files.selfie) {
      toast.error('Please complete all required fields and upload front + selfie.');
      return;
    }
    setLoading(true);
    try {
      const front = await upload(files.front, 'front');
      const back = files.back ? await upload(files.back, 'back') : null;
      const selfie = await upload(files.selfie, 'selfie');
      const { error } = await supabase.from('kyc_submissions').insert({
        user_id: user.id, ...form,
        front_image_url: front, back_image_url: back, selfie_image_url: selfie, status: 'pending',
      });
      if (error) throw error;
      await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id);
      toast.success('KYC submitted for review');
      setStatus('pending');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="h-6 w-6 text-gold" />
          <h1 className="font-display text-2xl md:text-3xl font-bold">Identity Verification</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">Verify your identity to unlock higher limits and faster withdrawals.</p>

        {(status === 'pending' || status === 'approved' || status === 'rejected') && (
          <div className={`card-premium mb-6 flex items-start gap-3 ${
            status === 'approved' ? 'border-success/40' : status === 'rejected' ? 'border-destructive/40' : 'border-yellow-500/40'
          }`}>
            {status === 'approved' ? <ShieldCheck className="h-6 w-6 text-success" />
              : status === 'rejected' ? <XCircle className="h-6 w-6 text-destructive" />
              : <Clock className="h-6 w-6 text-yellow-400" />}
            <div>
              <p className="font-semibold capitalize">{status}</p>
              <p className="text-sm text-muted-foreground">
                {status === 'approved' && 'Your account is fully verified.'}
                {status === 'pending' && 'Our team is reviewing your documents. This usually takes 1–24 hours.'}
                {status === 'rejected' && (latest?.admin_note || 'Please resubmit with clearer documents.')}
              </p>
            </div>
          </div>
        )}

        {(status === 'none' || status === 'rejected') && (
          <form onSubmit={submit} className="card-premium space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <L label="Full legal name">
                <input className="input" required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </L>
              <L label="Country">
                <input className="input" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
              </L>
              <L label="Document type">
                <select className="input" value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })}>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="driver_license">Driver's License</option>
                </select>
              </L>
              <L label="Document number">
                <input className="input" required value={form.document_number} onChange={e => setForm({ ...form, document_number: e.target.value })} />
              </L>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <FileSlot label="Document front *" onSet={f => setFiles({ ...files, front: f })} />
              <FileSlot label="Document back" onSet={f => setFiles({ ...files, back: f })} />
              <FileSlot label="Selfie holding doc *" onSet={f => setFiles({ ...files, selfie: f })} />
            </div>

            <p className="text-xs text-muted-foreground">By submitting, you confirm the documents are authentic and accept our KYC/AML policy.</p>
            <button disabled={loading} className="btn-gold w-full justify-center">
              {loading ? 'Uploading…' : 'Submit for review'}
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

function L({ label, children }: any) {
  return <label className="block"><span className="text-xs text-muted-foreground mb-1 block">{label}</span>{children}</label>;
}
function FileSlot({ label, onSet }: { label: string; onSet: (f: File) => void }) {
  const [name, setName] = useState<string>('');
  return (
    <label className="glass rounded-xl border border-dashed border-white/10 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold/40 transition">
      <Upload className="h-5 w-5 text-gold mb-1" />
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[10px] text-muted-foreground truncate max-w-full mt-1">{name || 'Click to upload'}</span>
      <input type="file" accept="image/*,application/pdf" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { setName(f.name); onSet(f); } }} />
    </label>
  );
}
