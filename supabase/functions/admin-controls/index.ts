import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_DOMAIN = 'kingbet.local'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const adminClient = createClient(supabaseUrl, serviceKey)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Unauthorized' }, 401)

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ error: 'Invalid token' }, 401)

    // Verify admin role
    const { data: roleData } = await adminClient.from('user_roles').select('role')
      .eq('user_id', user.id).single()
    if (!roleData || !['admin', 'superadmin'].includes(roleData.role)) {
      return json({ error: 'Admin access required' }, 403)
    }

    const { action, data } = await req.json()
    const isSuperAdmin = roleData.role === 'superadmin'

    switch (action) {
      case 'list_users':
        return await listUsers(adminClient, user.id, isSuperAdmin)
      case 'adjust_balance':
        return await adjustBalance(adminClient, user.id, data, isSuperAdmin)
      case 'block_user':
        return await updateUserStatus(adminClient, data.user_id, 'blocked')
      case 'unblock_user':
        return await updateUserStatus(adminClient, data.user_id, 'active')
      case 'suspend_user':
        return await updateUserStatus(adminClient, data.user_id, 'suspended')
      case 'create_user':
        return await createUser(adminClient, user.id, data, isSuperAdmin)
      case 'change_role':
        if (!isSuperAdmin) return json({ error: 'SuperAdmin only' }, 403)
        return await changeRole(adminClient, data)
      case 'list_bets':
        return await listBets(adminClient, data)
      case 'force_settle':
        return await forceSettle(adminClient, data)
      case 'platform_summary':
        return await platformSummary(adminClient)
      case 'pnl_report':
        return await pnlReport(adminClient, data)
      default:
        return json({ error: 'Invalid action' }, 400)
    }
  } catch (err) {
    console.error('Admin error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

async function listUsers(client: any, adminId: string, isSuperAdmin: boolean) {
  let query = client.from('profiles').select(`
    *, 
    wallets(balance, bonus_balance, exposure, total_profit_loss),
    user_roles(role)
  `)
  
  if (!isSuperAdmin) {
    query = query.eq('parent_id', adminId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return json({ error: error.message }, 500)
  return json({ users: data })
}

async function adjustBalance(client: any, adminId: string, data: any, isSuperAdmin: boolean) {
  const { user_id, amount, type } = data
  if (!user_id || !amount || !type) return json({ error: 'Missing params' }, 400)

  if (!isSuperAdmin) {
    const { data: profile } = await client.from('profiles').select('parent_id')
      .eq('id', user_id).single()
    if (!profile || profile.parent_id !== adminId) {
      return json({ error: 'Not in your downline' }, 403)
    }
  }

  const { data: wallet } = await client.from('wallets').select('*')
    .eq('user_id', user_id).single()
  if (!wallet) return json({ error: 'Wallet not found' }, 404)

  const amtNum = Math.abs(Number(amount))
  const newBalance = type === 'credit' 
    ? wallet.balance + amtNum 
    : Math.max(0, wallet.balance - amtNum)

  await client.from('wallets').update({ balance: newBalance }).eq('user_id', user_id)

  await client.from('transactions').insert({
    user_id,
    type: type === 'credit' ? 'admin_credit' : 'admin_debit',
    amount: amtNum,
    balance_before: wallet.balance,
    balance_after: newBalance,
    description: `Admin ${type} by ${adminId}`,
    reference_type: 'admin_adjustment',
  })

  return json({ success: true, new_balance: newBalance })
}

async function updateUserStatus(client: any, userId: string, status: string) {
  if (!userId) return json({ error: 'Missing user_id' }, 400)
  const { error } = await client.from('profiles').update({ status }).eq('id', userId)
  if (error) return json({ error: error.message }, 500)
  return json({ success: true, status })
}

async function createUser(client: any, adminId: string, data: any, isSuperAdmin: boolean) {
  const { email, password, username, role } = data
  // Support both userId-based and legacy email-based creation
  const userId = username || email
  if (!userId || !password) return json({ error: 'User ID and password are required' }, 400)
  
  // Map userId to internal email
  const internalEmail = email?.includes('@') ? email : `${userId.toLowerCase().trim()}@${EMAIL_DOMAIN}`

  // Only superadmin can create admins
  if (role === 'admin' && !isSuperAdmin) {
    return json({ error: 'Only SuperAdmin can create admins' }, 403)
  }
  if (role === 'superadmin') {
    return json({ error: 'Cannot create superadmin accounts' }, 403)
  }

  const { data: newUser, error } = await client.auth.admin.createUser({
    email: internalEmail,
    password,
    email_confirm: true,
    user_metadata: { username: userId },
  })
  if (error) return json({ error: error.message }, 500)

  // Set parent
  await client.from('profiles').update({ parent_id: adminId }).eq('id', newUser.user.id)

  // Set role if admin
  if (role === 'admin') {
    await client.from('user_roles').update({ role: 'admin' }).eq('user_id', newUser.user.id)
  }

  return json({ success: true, user_id: newUser.user.id, username: userId })
}

async function changeRole(client: any, data: any) {
  const { user_id, new_role } = data
  if (!user_id || !new_role) return json({ error: 'Missing params' }, 400)
  if (new_role === 'superadmin') return json({ error: 'Cannot assign superadmin' }, 403)

  const { error } = await client.from('user_roles')
    .update({ role: new_role }).eq('user_id', user_id)
  if (error) return json({ error: error.message }, 500)
  return json({ success: true })
}

async function listBets(client: any, data: any) {
  let query = client.from('bets').select('*')
  
  if (data?.user_id) query = query.eq('user_id', data.user_id)
  if (data?.status) query = query.eq('status', data.status)
  if (data?.market_id) query = query.eq('market_id', data.market_id)

  const { data: bets, error } = await query
    .order('created_at', { ascending: false }).limit(100)
  if (error) return json({ error: error.message }, 500)
  return json({ bets })
}

async function forceSettle(client: any, data: any) {
  const { bet_id, result } = data
  if (!bet_id || !result) return json({ error: 'Missing params' }, 400)

  const { data: bet } = await client.from('bets').select('*').eq('id', bet_id).single()
  if (!bet) return json({ error: 'Bet not found' }, 404)

  const { data: wallet } = await client.from('wallets').select('*')
    .eq('user_id', bet.user_id).single()
  if (!wallet) return json({ error: 'Wallet not found' }, 404)

  let profit = 0
  let newBalance = wallet.balance
  const newExposure = Math.max(0, wallet.exposure - bet.exposure)

  if (result === 'won') {
    profit = bet.potential_profit
    newBalance += profit
  } else if (result === 'lost') {
    profit = -bet.exposure
    newBalance = Math.max(0, newBalance - bet.exposure)
  }

  await client.from('bets').update({
    status: result === 'void' ? 'void' : result,
    actual_profit: profit,
    settled_at: new Date().toISOString(),
  }).eq('id', bet_id)

  await client.from('wallets').update({
    balance: newBalance,
    exposure: newExposure,
    total_profit_loss: wallet.total_profit_loss + profit,
  }).eq('user_id', bet.user_id)

  await client.from('transactions').insert({
    user_id: bet.user_id,
    type: result === 'won' ? 'bet_win' : 'bet_debit',
    amount: Math.abs(profit) || bet.exposure,
    balance_before: wallet.balance,
    balance_after: newBalance,
    description: `Force settle: ${result}`,
    reference_id: bet_id,
    reference_type: 'force_settle',
  })

  return json({ success: true, profit, new_balance: newBalance })
}

async function platformSummary(client: any) {
  const { data: wallets } = await client.from('wallets').select('balance, exposure, total_profit_loss')
  const { data: activeBets } = await client.from('bets').select('id')
    .in('status', ['pending', 'matched'])

  const totalBalance = wallets?.reduce((s: number, w: any) => s + Number(w.balance), 0) || 0
  const totalExposure = wallets?.reduce((s: number, w: any) => s + Number(w.exposure), 0) || 0
  const totalPnL = wallets?.reduce((s: number, w: any) => s + Number(w.total_profit_loss), 0) || 0

  return json({
    total_users: wallets?.length || 0,
    total_balance: totalBalance,
    total_exposure: totalExposure,
    total_pnl: totalPnL,
    active_bets: activeBets?.length || 0,
    total_liability: totalExposure,
  })
}

async function pnlReport(client: any, data: any) {
  const { period, user_id } = data || {}

  let fromDate = new Date()
  if (period === 'daily') fromDate.setDate(fromDate.getDate() - 1)
  else if (period === 'weekly') fromDate.setDate(fromDate.getDate() - 7)
  else if (period === 'monthly') fromDate.setMonth(fromDate.getMonth() - 1)
  else fromDate = new Date('2020-01-01')

  let query = client.from('transactions').select('*')
    .gte('created_at', fromDate.toISOString())
    .order('created_at', { ascending: false })

  if (user_id) query = query.eq('user_id', user_id)

  const { data: txns, error } = await query.limit(500)
  if (error) return json({ error: error.message }, 500)

  const totalCredit = txns?.filter((t: any) => ['bet_win', 'admin_credit', 'deposit', 'bonus_credit'].includes(t.type))
    .reduce((s: number, t: any) => s + Number(t.amount), 0) || 0
  const totalDebit = txns?.filter((t: any) => ['bet_debit', 'admin_debit', 'withdrawal'].includes(t.type))
    .reduce((s: number, t: any) => s + Number(t.amount), 0) || 0

  return json({
    period,
    total_credit: totalCredit,
    total_debit: totalDebit,
    net_pnl: totalCredit - totalDebit,
    transaction_count: txns?.length || 0,
  })
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
