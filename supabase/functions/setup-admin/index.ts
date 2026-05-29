// One-time bootstrap function to create/update the default Super Admin.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EMAIL = 'admin@kingbet.local';
const PASSWORD = 'KingBet@2026';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    let user = list.users.find((u) => u.email === EMAIL) ?? null;

    if (user) {
      await admin.auth.admin.updateUserById(user.id, { password: PASSWORD, email_confirm: true });
    } else {
      const { data, error } = await admin.auth.admin.createUser({
        email: EMAIL, password: PASSWORD, email_confirm: true,
        user_metadata: { full_name: 'Super Admin', username: 'admin' },
      });
      if (error) return j({ error: error.message }, 500);
      user = data.user;
    }

    const uid = user!.id;
    await admin.from('profiles').upsert({ id: uid, username: 'admin', full_name: 'Super Admin', email: EMAIL }, { onConflict: 'id' });

    const { data: roles } = await admin.from('user_roles').select('id').eq('user_id', uid);
    if (roles && roles.length) await admin.from('user_roles').update({ role: 'superadmin' }).eq('user_id', uid);
    else await admin.from('user_roles').insert({ user_id: uid, role: 'superadmin' });

    const { data: w } = await admin.from('wallets').select('user_id').eq('user_id', uid).maybeSingle();
    if (!w) await admin.from('wallets').insert({ user_id: uid, balance: 0 });

    return j({ ok: true, user_id: uid, email: EMAIL, role: 'superadmin' });
  } catch (e) {
    return j({ error: String((e as Error)?.message || e) }, 500);
  }
});

function j(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
