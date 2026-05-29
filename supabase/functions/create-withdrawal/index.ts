// Atomically debits user wallet & creates a withdrawal request.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth) return j({ error: 'unauthorized' }, 401);
    const user = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user: u } } = await user.auth.getUser();
    if (!u) return j({ error: 'unauthorized' }, 401);

    const body = await req.json();
    const amount = Number(body.amount);
    const { crypto_symbol, network, wallet_address } = body;
    if (!amount || amount <= 0 || !crypto_symbol || !network || !wallet_address) return j({ error: 'invalid input' }, 400);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: profile } = await admin.from('profiles').select('kyc_status').eq('id', u.id).single();
    if (profile?.kyc_status !== 'approved') {
      return j({ error: 'KYC verification is required before withdrawals can be processed.' }, 403);
    }

    const { data: w } = await admin.from('wallets').select('balance, pending_withdrawal').eq('user_id', u.id).single();
    if (!w || Number(w.balance) < amount) return j({ error: 'Insufficient balance' }, 400);

    await admin.from('wallets').update({
      balance: Number(w.balance) - amount,
      pending_withdrawal: Number(w.pending_withdrawal ?? 0) + amount,
      updated_at: new Date().toISOString(),
    }).eq('user_id', u.id);

    const { data: wd, error } = await admin.from('withdrawals').insert({
      user_id: u.id, amount, crypto_symbol, network, wallet_address, status: 'pending',
    }).select().single();
    if (error) return j({ error: error.message }, 500);

    return j({ ok: true, withdrawal: wd });
  } catch (e) {
    return j({ error: String(e?.message || e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
