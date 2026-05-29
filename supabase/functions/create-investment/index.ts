// Atomically purchases an investment plan: debits wallet, creates investment, logs transaction.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth) return j({ error: 'unauthorized' }, 401);
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data: { user: u } } = await userClient.auth.getUser();
    if (!u) return j({ error: 'unauthorized' }, 401);

    const body = await req.json();
    const planId = String(body.plan_id || '');
    const amount = Number(body.amount);
    if (!planId || !amount || amount <= 0) return j({ error: 'Invalid input' }, 400);

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: plan } = await admin.from('investment_plans').select('*').eq('id', planId).eq('is_active', true).single();
    if (!plan) return j({ error: 'Plan not found' }, 404);
    if (amount < Number(plan.min_deposit) || amount > Number(plan.max_deposit)) {
      return j({ error: `Amount must be between ${plan.min_deposit} and ${plan.max_deposit}` }, 400);
    }

    const { data: w } = await admin.from('wallets').select('balance, active_investment').eq('user_id', u.id).single();
    const before = Number(w?.balance ?? 0);
    if (before < amount) return j({ error: 'Insufficient balance' }, 400);
    const after = before - amount;

    await admin.from('wallets').update({
      balance: after,
      active_investment: Number(w?.active_investment ?? 0) + amount,
      updated_at: new Date().toISOString(),
    }).eq('user_id', u.id);

    const end = new Date();
    end.setDate(end.getDate() + Number(plan.duration_days || 30));
    const { data: inv, error: invErr } = await admin.from('investments').insert({
      user_id: u.id, plan_id: planId, amount,
      monthly_return_percent: Number(plan.monthly_return_percent),
      status: 'active', end_date: end.toISOString(),
    }).select().single();
    if (invErr) return j({ error: invErr.message }, 500);

    await admin.from('transactions').insert({
      user_id: u.id, type: 'investment', amount: -amount,
      balance_before: before, balance_after: after,
      description: `Invested in ${plan.name}`, reference_id: inv.id, reference_type: 'investment',
    });

    return j({ ok: true, investment: inv });
  } catch (e) {
    console.error('create-investment error', e);
    return j({ error: String(e?.message || e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
