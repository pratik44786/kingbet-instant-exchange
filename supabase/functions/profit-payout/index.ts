// Scheduled job: pays daily profit share to all active investments.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const today = new Date();
  const { data: invs, error } = await admin.from('investments').select('*').eq('status', 'active');
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  let processed = 0, paid = 0;
  for (const inv of invs ?? []) {
    const last = inv.last_payout_at ? new Date(inv.last_payout_at) : new Date(inv.start_date);
    const hoursSince = (today.getTime() - last.getTime()) / 36e5;
    if (hoursSince < 24) continue;
    // Daily profit = monthly_return_percent / 30
    const dailyRate = Number(inv.monthly_return_percent) / 100 / 30;
    const profit = Math.round(Number(inv.amount) * dailyRate * 100) / 100;
    if (profit <= 0) continue;
    const { error: rpcErr } = await admin.rpc('distribute_profit_to_investment', { _investment_id: inv.id, _profit: profit });
    if (rpcErr) { console.error(rpcErr); continue; }
    processed++;
    paid += profit;

    // Auto-close investments past duration
    const start = new Date(inv.start_date);
    const ageDays = (today.getTime() - start.getTime()) / 86400000;
    if (ageDays >= Number(inv.duration_days)) {
      await admin.from('investments').update({ status: 'completed', end_date: today.toISOString() }).eq('id', inv.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, processed, paid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
