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

interface ProcessResult {
  ok?: boolean;
  reason?: string;
  status?: string;
  user_id?: string;
  amount?: number | string;
  crypto_symbol?: string;
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

    const notify = (uid: string, title: string, bdy: string, type: string, link: string) =>
      admin.from('notifications').insert({ user_id: uid, title, body: bdy, type, link });

    const alreadyProcessed = (result: ProcessResult) => {
      if (result?.reason === 'already_processed') {
        return j({ ok: true, already_processed: true, status: result.status });
      }
      if (result?.reason === 'not_found') return j({ error: 'not found' }, 404);
      return null;
    };

    if (body.action === 'approve_deposit') {
      const { data: result, error } = await admin.rpc('process_deposit_approval', {
        _deposit_id: body.id, _admin_id: user.id, _tx_hash: body.tx_hash ?? null, _note: body.note ?? null,
      });
      if (error) throw error;
      const handled = alreadyProcessed(result as ProcessResult);
      if (handled) return handled;
      const r = result as ProcessResult;
      await notify(r.user_id!, 'Deposit approved', `Your deposit of ${r.amount} ${r.crypto_symbol} has been credited.`, 'success', '/dashboard');
      return j({ ok: true });
    }

    if (body.action === 'reject_deposit') {
      const { data: result, error } = await admin.rpc('process_deposit_rejection', {
        _deposit_id: body.id, _admin_id: user.id, _note: body.note ?? null,
      });
      if (error) throw error;
      const handled = alreadyProcessed(result as ProcessResult);
      if (handled) return handled;
      const r = result as ProcessResult;
      await notify(r.user_id!, 'Deposit rejected', `Your deposit of ${r.amount} ${r.crypto_symbol} was rejected.${body.note ? ' Note: ' + body.note : ''}`, 'error', '/deposit');
      return j({ ok: true });
    }

    if (body.action === 'approve_withdrawal') {
      const { data: result, error } = await admin.rpc('process_withdrawal_approval', {
        _withdrawal_id: body.id, _admin_id: user.id, _tx_hash: body.tx_hash ?? null, _note: body.note ?? null,
      });
      if (error) throw error;
      const handled = alreadyProcessed(result as ProcessResult);
      if (handled) return handled;
      const r = result as ProcessResult;
      await notify(r.user_id!, 'Withdrawal approved', `Your withdrawal of ${r.amount} ${r.crypto_symbol} has been processed.`, 'success', '/dashboard');
      return j({ ok: true });
    }

    if (body.action === 'reject_withdrawal') {
      const { data: result, error } = await admin.rpc('process_withdrawal_rejection', {
        _withdrawal_id: body.id, _admin_id: user.id, _note: body.note ?? null,
      });
      if (error) throw error;
      const handled = alreadyProcessed(result as ProcessResult);
      if (handled) return handled;
      const r = result as ProcessResult;
      await notify(r.user_id!, 'Withdrawal rejected', `Your withdrawal of ${r.amount} ${r.crypto_symbol} was rejected and refunded.${body.note ? ' Note: ' + body.note : ''}`, 'warning', '/dashboard');
      return j({ ok: true });
    }

    if (body.action === 'approve_kyc' || body.action === 'reject_kyc') {
      const status = body.action === 'approve_kyc' ? 'approved' : 'rejected';
      const { data: result, error } = await admin.rpc('process_kyc_review', {
        _kyc_id: body.id, _admin_id: user.id, _status: status, _note: body.note ?? null,
      });
      if (error) throw error;
      const handled = alreadyProcessed(result as ProcessResult);
      if (handled) return handled;
      const r = result as ProcessResult;
      if (r.reason === 'invalid_status') return j({ error: 'invalid status' }, 400);
      await notify(r.user_id!, status === 'approved' ? 'KYC approved' : 'KYC rejected',
        status === 'approved' ? 'Your identity has been verified. You can now withdraw.' : `Your KYC was rejected.${body.note ? ' Note: ' + body.note : ''}`,
        status === 'approved' ? 'success' : 'error', '/kyc');
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
