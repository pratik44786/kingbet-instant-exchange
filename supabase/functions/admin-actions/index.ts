// Admin actions: approve/reject deposits, withdrawals, KYC; manual adjustments.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

interface Body {
  action: 'approve_deposit' | 'reject_deposit' | 'approve_withdrawal' | 'reject_withdrawal' | 'approve_kyc' | 'reject_kyc';
  id: string;
  note?: string;
  tx_hash?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    const token = auth.replace('Bearer ', '');
    if (!token) return j({ error: 'unauthorized' }, 401);

    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return j({ error: 'unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: isAdmin } = await admin.rpc('is_admin_or_above', { uid: user.id });
    if (!isAdmin) return j({ error: 'forbidden' }, 403);

    const body = await req.json() as Body;
    if (!body?.action || !body?.id) return j({ error: 'bad request' }, 400);

    const now = new Date().toISOString();
    const reviewer = { reviewed_at: now, reviewed_by: user.id, admin_note: body.note ?? null };

    const notify = (uid: string, title: string, bdy: string, type: string, link: string) =>
      admin.from('notifications').insert({ user_id: uid, title, body: bdy, type, link });

    if (body.action === 'approve_deposit') {
      const { data: d } = await admin.from('deposits').select('*').eq('id', body.id).single();
      if (!d || d.status !== 'pending') return j({ error: 'invalid state' }, 400);
      const { data: w } = await admin.from('wallets').select('balance').eq('user_id', d.user_id).single();
      const before = Number(w?.balance ?? 0);
      const after = before + Number(d.amount);
      await admin.from('wallets').update({ balance: after, updated_at: now }).eq('user_id', d.user_id);
      await admin.from('deposits').update({ status: 'approved', transaction_hash: body.tx_hash ?? d.transaction_hash, ...reviewer }).eq('id', body.id);
      await admin.from('transactions').insert({
        user_id: d.user_id, type: 'deposit', amount: Number(d.amount),
        balance_before: before, balance_after: after,
        description: `Deposit approved (${d.crypto_symbol})`, reference_id: d.id, reference_type: 'deposit',
      });
      await notify(d.user_id, 'Deposit approved', `Your deposit of ${d.amount} ${d.crypto_symbol} has been credited.`, 'success', '/dashboard');
      return j({ ok: true });
    }

    if (body.action === 'reject_deposit') {
      const { data: d } = await admin.from('deposits').select('user_id, amount, crypto_symbol').eq('id', body.id).single();
      await admin.from('deposits').update({ status: 'rejected', ...reviewer }).eq('id', body.id);
      if (d) await notify(d.user_id, 'Deposit rejected', `Your deposit of ${d.amount} ${d.crypto_symbol} was rejected.${body.note ? ' Note: ' + body.note : ''}`, 'error', '/deposit');
      return j({ ok: true });
    }

    if (body.action === 'approve_withdrawal') {
      const { data: wd } = await admin.from('withdrawals').select('*').eq('id', body.id).single();
      if (!wd || wd.status !== 'pending') return j({ error: 'invalid state' }, 400);
      const { data: w } = await admin.from('wallets').select('balance, pending_withdrawal').eq('user_id', wd.user_id).single();
      const before = Number(w?.balance ?? 0);
      const pending = Math.max(0, Number(w?.pending_withdrawal ?? 0) - Number(wd.amount));
      await admin.from('wallets').update({ pending_withdrawal: pending, updated_at: now }).eq('user_id', wd.user_id);
      await admin.from('withdrawals').update({ status: 'approved', transaction_hash: body.tx_hash ?? wd.transaction_hash, ...reviewer }).eq('id', body.id);
      await admin.from('transactions').insert({
        user_id: wd.user_id, type: 'withdrawal', amount: -Number(wd.amount),
        balance_before: before, balance_after: before,
        description: `Withdrawal approved (${wd.crypto_symbol})`, reference_id: wd.id, reference_type: 'withdrawal',
      });
      await notify(wd.user_id, 'Withdrawal approved', `Your withdrawal of ${wd.amount} ${wd.crypto_symbol} has been processed.`, 'success', '/dashboard');
      return j({ ok: true });
    }

    if (body.action === 'reject_withdrawal') {
      const { data: wd } = await admin.from('withdrawals').select('*').eq('id', body.id).single();
      if (!wd || wd.status !== 'pending') return j({ error: 'invalid state' }, 400);
      const { data: w } = await admin.from('wallets').select('balance, pending_withdrawal').eq('user_id', wd.user_id).single();
      const refundedBefore = Number(w?.balance ?? 0);
      const refundedAfter = refundedBefore + Number(wd.amount);
      const pending = Math.max(0, Number(w?.pending_withdrawal ?? 0) - Number(wd.amount));
      await admin.from('wallets').update({ balance: refundedAfter, pending_withdrawal: pending, updated_at: now }).eq('user_id', wd.user_id);
      await admin.from('withdrawals').update({ status: 'rejected', ...reviewer }).eq('id', body.id);
      await admin.from('transactions').insert({
        user_id: wd.user_id, type: 'admin_adjustment', amount: Number(wd.amount),
        balance_before: refundedBefore, balance_after: refundedAfter,
        description: `Withdrawal rejected — refund`, reference_id: wd.id, reference_type: 'withdrawal',
      });
      return j({ ok: true });
    }

    if (body.action === 'approve_kyc' || body.action === 'reject_kyc') {
      const status = body.action === 'approve_kyc' ? 'approved' : 'rejected';
      const { data: k } = await admin.from('kyc_submissions').update({ status, ...reviewer }).eq('id', body.id).select().single();
      if (k) await admin.from('profiles').update({ kyc_status: status }).eq('id', k.user_id);
      return j({ ok: true });
    }

    return j({ error: 'unknown action' }, 400);
  } catch (e) {
    console.error('admin-actions error', e);
    return j({ error: String(e?.message || e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
