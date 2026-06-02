import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Check, X, RefreshCw, Shield, ArrowDownToLine, ArrowUpFromLine, FileCheck, Settings2, Wallet2, Building2 } from 'lucide-react';

type Tab = 'deposits' | 'withdrawals' | 'kyc' | 'plans' | 'addresses' | 'company';

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: 'deposits', label: 'Deposits', icon: ArrowDownToLine },
  { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
  { id: 'kyc', label: 'KYC', icon: FileCheck },
  { id: 'plans', label: 'Plans', icon: Settings2 },
  { id: 'addresses', label: 'Addresses', icon: Wallet2 },
  { id: 'company', label: 'Company', icon: Building2 },
];

export default function Admin() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('deposits');

  if (isLoading) return null;
  if (!user || !['admin', 'master_admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-gold" />
        <h1 className="font-display text-2xl md:text-3xl font-bold">Admin Console</h1>
      </div>

      <div className="flex gap-1 overflow-x-auto mb-6 pb-2">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-gradient-gold text-primary-foreground' : 'glass text-muted-foreground hover:text-foreground'
            }`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'deposits' && <DepositsPanel />}
      {tab === 'withdrawals' && <WithdrawalsPanel />}
      {tab === 'kyc' && <KycPanel />}
      {tab === 'plans' && <PlansPanel />}
      {tab === 'addresses' && <AddressesPanel />}
      {tab === 'company' && <CompanyPanel />}
    </DashboardLayout>
  );
}

function useRows<T>(table: string, filter?: (q: any) => any) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    let q = supabase.from(table as any).select('*').order('created_at', { ascending: false }).limit(100);
    if (filter) q = filter(q);
    const { data } = await q;
    setRows((data as T[]) || []); setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  return { rows, loading, reload: load };
}

async function callAdmin(action: string, id: string, extra: Record<string, any> = {}) {
  const { data, error } = await supabase.functions.invoke('admin-actions', { body: { action, id, ...extra } });
  if (error || (data as any)?.error) { toast.error((data as any)?.error || error?.message || 'Action failed'); return false; }
  toast.success((data as any)?.already_processed ? 'Already processed' : 'Done'); return true;
}

function DepositsPanel() {
  const { rows, loading, reload } = useRows<any>('deposits');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const run = async (action: string, id: string, extra: Record<string, any> = {}) => {
    if (processingId) return;
    setProcessingId(id);
    try { if (await callAdmin(action, id, extra)) await reload(); }
    finally { setProcessingId(null); }
  };
  return (
    <Panel title="Deposit requests" onRefresh={reload} loading={loading} empty={rows.length === 0}>
      {rows.map((d) => (
        <Row key={d.id} status={d.status}
          left={<>
            <p className="font-mono text-sm">{d.crypto_symbol} · {d.network}</p>
            <p className="text-xs text-muted-foreground">User {d.user_id.slice(0, 8)} · {new Date(d.created_at).toLocaleString()}</p>
            {d.transaction_hash && <p className="text-xs text-muted-foreground font-mono truncate">tx: {d.transaction_hash}</p>}
          </>}
          amount={`$${Number(d.amount).toFixed(2)}`}
          actions={d.status === 'pending' && (
            <>
              <button disabled={processingId === d.id} onClick={() => run('approve_deposit', d.id)} className="btn-icon-success disabled:opacity-50"><Check className="h-4 w-4" /></button>
              <button disabled={processingId === d.id} onClick={() => { const note = prompt('Reason?') || ''; run('reject_deposit', d.id, { note }); }} className="btn-icon-danger disabled:opacity-50"><X className="h-4 w-4" /></button>
            </>
          )} />
      ))}
    </Panel>
  );
}

function WithdrawalsPanel() {
  const { rows, loading, reload } = useRows<any>('withdrawals');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const run = async (action: string, id: string, extra: Record<string, any> = {}) => {
    if (processingId) return;
    setProcessingId(id);
    try { if (await callAdmin(action, id, extra)) await reload(); }
    finally { setProcessingId(null); }
  };
  return (
    <Panel title="Withdrawal requests" onRefresh={reload} loading={loading} empty={rows.length === 0}>
      {rows.map((w) => (
        <Row key={w.id} status={w.status}
          left={<>
            <p className="font-mono text-sm">{w.crypto_symbol} · {w.network}</p>
            <p className="text-xs text-muted-foreground font-mono truncate">to: {w.wallet_address}</p>
            <p className="text-xs text-muted-foreground">User {w.user_id.slice(0, 8)} · {new Date(w.created_at).toLocaleString()}</p>
          </>}
          amount={`$${Number(w.amount).toFixed(2)}`}
          actions={w.status === 'pending' && (
            <>
              <button disabled={processingId === w.id} onClick={() => { const tx = prompt('Transaction hash:') || ''; run('approve_withdrawal', w.id, { tx_hash: tx }); }} className="btn-icon-success disabled:opacity-50"><Check className="h-4 w-4" /></button>
              <button disabled={processingId === w.id} onClick={() => { const note = prompt('Reason?') || ''; run('reject_withdrawal', w.id, { note }); }} className="btn-icon-danger disabled:opacity-50"><X className="h-4 w-4" /></button>
            </>
          )} />
      ))}
    </Panel>
  );
}

function KycPanel() {
  const { rows, loading, reload } = useRows<any>('kyc_submissions');
  return (
    <Panel title="KYC submissions" onRefresh={reload} loading={loading} empty={rows.length === 0}>
      {rows.map((k) => (
        <div key={k.id} className="glass rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{k.full_name}</p>
              <p className="text-xs text-muted-foreground">{k.document_type} · {k.document_number} · {k.country || '—'}</p>
              <p className="text-xs text-muted-foreground">User {k.user_id.slice(0, 8)} · {new Date(k.created_at).toLocaleString()}</p>
            </div>
            <StatusPill status={k.status} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[k.front_image_url, k.back_image_url, k.selfie_image_url].filter(Boolean).map((u, i) => (
              <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-video rounded-lg bg-muted overflow-hidden">
                <img src={u} alt="doc" className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
          {k.status === 'pending' && (
            <div className="flex gap-2">
              <button onClick={async () => { if (await callAdmin('approve_kyc', k.id)) reload(); }} className="btn-gold !py-2 !px-4 text-sm flex-1"><Check className="h-4 w-4" /> Approve</button>
              <button onClick={async () => { const note = prompt('Reason?') || ''; if (await callAdmin('reject_kyc', k.id, { note })) reload(); }} className="btn-outline-gold !py-2 !px-4 text-sm flex-1 !border-destructive/40 !text-destructive"><X className="h-4 w-4" /> Reject</button>
            </div>
          )}
        </div>
      ))}
    </Panel>
  );
}

function PlansPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const load = async () => { const { data } = await supabase.from('investment_plans').select('*').order('sort_order'); setRows(data || []); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing };
    delete payload.created_at; delete payload.updated_at;
    const { error } = editing.id
      ? await supabase.from('investment_plans').update(payload).eq('id', editing.id)
      : await supabase.from('investment_plans').insert(payload);
    if (error) toast.error(error.message); else { toast.success('Plan saved'); setEditing(null); load(); }
  };
  const remove = async (id: string) => {
    if (!confirm('Delete plan?')) return;
    const { error } = await supabase.from('investment_plans').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deleted'); load(); }
  };

  return (
    <Panel title="Investment plans" onRefresh={load} loading={false} empty={false}
      header={<button className="btn-gold !py-2 !px-4 text-sm" onClick={() => setEditing({ name: '', monthly_return_percent: 5, min_deposit: 100, max_deposit: 10000, duration_days: 30, payout_frequency: 'daily', is_active: true, sort_order: rows.length })}>+ New plan</button>}>
      {rows.map(p => (
        <Row key={p.id} status={p.is_active ? 'active' : 'paused'}
          left={<>
            <p className="font-semibold">{p.name}</p>
            <p className="text-xs text-muted-foreground">{p.monthly_return_percent}% / mo · ${p.min_deposit}–${p.max_deposit} · {p.duration_days}d · {p.payout_frequency}</p>
          </>} amount=""
          actions={<>
            <button onClick={() => setEditing(p)} className="btn-outline-gold !py-1.5 !px-3 text-xs">Edit</button>
            <button onClick={() => remove(p.id)} className="btn-icon-danger"><X className="h-4 w-4" /></button>
          </>} />
      ))}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Edit plan' : 'New plan'}>
          <FormGrid>
            <Field label="Name"><input className="input" value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Monthly return %"><input type="number" className="input" value={editing.monthly_return_percent} onChange={e => setEditing({ ...editing, monthly_return_percent: Number(e.target.value) })} /></Field>
            <Field label="Min deposit"><input type="number" className="input" value={editing.min_deposit} onChange={e => setEditing({ ...editing, min_deposit: Number(e.target.value) })} /></Field>
            <Field label="Max deposit"><input type="number" className="input" value={editing.max_deposit} onChange={e => setEditing({ ...editing, max_deposit: Number(e.target.value) })} /></Field>
            <Field label="Duration (days)"><input type="number" className="input" value={editing.duration_days} onChange={e => setEditing({ ...editing, duration_days: Number(e.target.value) })} /></Field>
            <Field label="Payout frequency">
              <select className="input" value={editing.payout_frequency} onChange={e => setEditing({ ...editing, payout_frequency: e.target.value })}>
                <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label="Sort order"><input type="number" className="input" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            <Field label="Active"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /></Field>
            <div className="col-span-2"><Field label="Description"><textarea className="input min-h-24" value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })} /></Field></div>
          </FormGrid>
          <div className="flex gap-2 mt-4"><button onClick={save} className="btn-gold flex-1">Save</button><button onClick={() => setEditing(null)} className="btn-outline-gold flex-1">Cancel</button></div>
        </Modal>
      )}
    </Panel>
  );
}

function AddressesPanel() {
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const load = async () => { const { data } = await supabase.from('deposit_addresses').select('*').order('sort_order'); setRows(data || []); };
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!editing) return;
    const p = { ...editing }; delete p.created_at; delete p.updated_at;
    const { error } = editing.id ? await supabase.from('deposit_addresses').update(p).eq('id', editing.id) : await supabase.from('deposit_addresses').insert(p);
    if (error) toast.error(error.message); else { toast.success('Saved'); setEditing(null); load(); }
  };
  const remove = async (id: string) => { if (!confirm('Delete?')) return; await supabase.from('deposit_addresses').delete().eq('id', id); load(); };

  return (
    <Panel title="Deposit addresses" onRefresh={load} loading={false} empty={false}
      header={<button className="btn-gold !py-2 !px-4 text-sm" onClick={() => setEditing({ crypto_name: '', crypto_symbol: '', network: '', wallet_address: '', min_deposit: 10, is_active: true, sort_order: rows.length })}>+ New address</button>}>
      {rows.map(a => (
        <Row key={a.id} status={a.is_active ? 'active' : 'paused'}
          left={<>
            <p className="font-semibold">{a.crypto_name} <span className="text-muted-foreground text-xs">({a.crypto_symbol} · {a.network})</span></p>
            <p className="text-xs text-muted-foreground font-mono truncate">{a.wallet_address}</p>
            <p className="text-xs text-muted-foreground">Min ${a.min_deposit}</p>
          </>} amount=""
          actions={<>
            <button onClick={() => setEditing(a)} className="btn-outline-gold !py-1.5 !px-3 text-xs">Edit</button>
            <button onClick={() => remove(a.id)} className="btn-icon-danger"><X className="h-4 w-4" /></button>
          </>} />
      ))}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? 'Edit address' : 'New address'}>
          <FormGrid>
            <Field label="Crypto name"><input className="input" value={editing.crypto_name} onChange={e => setEditing({ ...editing, crypto_name: e.target.value })} /></Field>
            <Field label="Symbol"><input className="input" value={editing.crypto_symbol} onChange={e => setEditing({ ...editing, crypto_symbol: e.target.value.toUpperCase() })} /></Field>
            <Field label="Network"><input className="input" value={editing.network} onChange={e => setEditing({ ...editing, network: e.target.value })} /></Field>
            <Field label="Min deposit"><input type="number" className="input" value={editing.min_deposit} onChange={e => setEditing({ ...editing, min_deposit: Number(e.target.value) })} /></Field>
            <div className="col-span-2"><Field label="Wallet address"><input className="input font-mono text-xs" value={editing.wallet_address} onChange={e => setEditing({ ...editing, wallet_address: e.target.value })} /></Field></div>
            <div className="col-span-2"><Field label="QR image URL (optional)"><input className="input" value={editing.qr_image_url || ''} onChange={e => setEditing({ ...editing, qr_image_url: e.target.value })} /></Field></div>
            <Field label="Sort order"><input type="number" className="input" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            <Field label="Active"><input type="checkbox" checked={editing.is_active} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /></Field>
          </FormGrid>
          <div className="flex gap-2 mt-4"><button onClick={save} className="btn-gold flex-1">Save</button><button onClick={() => setEditing(null)} className="btn-outline-gold flex-1">Cancel</button></div>
        </Modal>
      )}
    </Panel>
  );
}

function CompanyPanel() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const load = async () => {
    const { data: row } = await supabase.from('company_settings').select('*').order('created_at').limit(1).maybeSingle();
    setData(row || { company_name: 'KINGBET EXCHANGE' });
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const payload = { ...data }; delete payload.created_at; delete payload.updated_at;
    const { error } = data.id
      ? await supabase.from('company_settings').update(payload).eq('id', data.id)
      : await supabase.from('company_settings').insert(payload);
    setSaving(false);
    if (error) toast.error(error.message); else { toast.success('Company settings saved'); load(); }
  };

  if (!data) return <div className="card-premium"><p className="text-sm text-muted-foreground py-6 text-center">Loading…</p></div>;

  const fields: [string, string][] = [
    ['company_name', 'Company name'], ['tagline', 'Tagline'],
    ['ceo_name', 'CEO name'], ['founder_name', 'Founder name'],
    ['support_email', 'Support email'], ['support_phone', 'Support phone'],
    ['office_address', 'Office address'],
    ['twitter_url', 'Twitter URL'], ['facebook_url', 'Facebook URL'],
    ['instagram_url', 'Instagram URL'], ['telegram_url', 'Telegram URL'],
    ['logo_url', 'Logo URL'], ['favicon_url', 'Favicon URL'],
  ];

  return (
    <div className="card-premium">
      <h2 className="font-display text-lg font-semibold mb-4">Company management</h2>
      <FormGrid>
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input className="input" value={data[key] || ''} onChange={e => setData({ ...data, [key]: e.target.value })} />
          </Field>
        ))}
      </FormGrid>
      <button onClick={save} disabled={saving} className="btn-gold mt-4">{saving ? 'Saving…' : 'Save settings'}</button>
    </div>
  );
}

/* ---------- shared bits ---------- */
function Panel({ title, children, onRefresh, loading, empty, header }: any) {
  return (
    <div className="card-premium">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <div className="flex gap-2">
          {header}
          <button onClick={onRefresh} className="p-2 rounded-lg glass hover:bg-white/10"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>
      {loading ? <p className="text-sm text-muted-foreground py-6 text-center">Loading…</p>
        : empty ? <p className="text-sm text-muted-foreground py-10 text-center">Nothing here yet.</p>
        : <div className="space-y-3">{children}</div>}
    </div>
  );
}
function Row({ left, amount, status, actions }: any) {
  return (
    <div className="glass rounded-xl p-4 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">{left}</div>
      {amount && <p className="font-display font-bold text-gold whitespace-nowrap">{amount}</p>}
      <StatusPill status={status} />
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    approved: 'bg-success/10 text-success border-success/30',
    rejected: 'bg-destructive/10 text-destructive border-destructive/30',
    active: 'bg-success/10 text-success border-success/30',
    paused: 'bg-muted text-muted-foreground border-border',
  };
  return <span className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded-full border ${map[status] || map.paused}`}>{status}</span>;
}
function Modal({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur" onClick={onClose}>
      <div className="card-premium max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}
function FormGrid({ children }: any) { return <div className="grid grid-cols-2 gap-3">{children}</div>; }
function Field({ label, children }: any) { return <label className="block"><span className="text-xs text-muted-foreground mb-1 block">{label}</span>{children}</label>; }
