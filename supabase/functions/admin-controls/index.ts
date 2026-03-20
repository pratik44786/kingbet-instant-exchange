import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const EMAIL_DOMAIN = 'kingbet.local'

// Simple hash for transaction PIN (using Web Crypto API available in Deno)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin + '_kingbet_salt_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function verifyTransactionPin(client: any, adminId: string, pin: string): Promise<{ valid: boolean; isNew: boolean }> {
  const { data: existing } = await client.from('transaction_pins').select('pin_hash').eq('user_id', adminId).single()
  
  if (!existing) {
    // First time — set the PIN
    const hashed = await hashPin(pin)
    await client.from('transaction_pins').insert({ user_id: adminId, pin_hash: hashed })
    return { valid: true, isNew: true }
  }

  // Verify existing PIN
  const hashed = await hashPin(pin)
  return { valid: hashed === existing.pin_hash, isNew: false }
}

async function logAudit(client: any, adminId: string, targetUserId: string, action: string, amount: number, type: string, status: string, details?: any) {
  await client.from('transaction_audit').insert({
    admin_id: adminId,
    target_user_id: targetUserId,
    action,
    amount,
    type,
    status,
    details: details || {},
  })
}

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
    if (!roleData || !['admin', 'master_admin', 'superadmin'].includes(roleData.role)) {
      return json({ error: 'Admin access required' }, 403)
    }

    const { action, data } = await req.json()
    const isSuperAdmin = roleData.role === 'superadmin'
    const isMasterAdmin = roleData.role === 'master_admin'

    switch (action) {
      case 'list_users':
        return await listUsers(adminClient, user.id, isSuperAdmin, isMasterAdmin)
      case 'adjust_balance':
        return await adjustBalance(adminClient, user.id, data, isSuperAdmin, isMasterAdmin)
      case 'block_user':
        return await updateUserStatus(adminClient, data.user_id, 'blocked')
      case 'unblock_user':
        return await updateUserStatus(adminClient, data.user_id, 'active')
      case 'suspend_user':
        return await updateUserStatus(adminClient, data.user_id, 'suspended')
      case 'create_user':
        return await createUser(adminClient, user.id, data, isSuperAdmin, isMasterAdmin)
      case 'change_role':
        if (!isSuperAdmin && !isMasterAdmin) return json({ error: 'SuperAdmin or MasterAdmin only' }, 403)
        return await changeRole(adminClient, data, isSuperAdmin)
      case 'list_bets':
        return await listBets(adminClient, data)
      case 'force_settle':
        return await forceSettle(adminClient, data)
      case 'platform_summary':
        return await platformSummary(adminClient)
      case 'pnl_report':
        return await pnlReport(adminClient, data)
      case 'check_pin': {
        const { data: pinRow } = await adminClient.from('transaction_pins').select('id').eq('user_id', user.id).single()
        return json({ has_pin: !!pinRow })
      }
      case 'change_pin': {
        const { old_pin, new_pin } = data
        if (!new_pin || new_pin.length < 4) return json({ error: 'PIN must be at least 4 characters' }, 400)
        const { data: existing } = await adminClient.from('transaction_pins').select('pin_hash').eq('user_id', user.id).single()
        if (existing) {
          if (!old_pin) return json({ error: 'Current PIN required' }, 400)
          const oldHash = await hashPin(old_pin)
          if (oldHash !== existing.pin_hash) return json({ error: 'Current PIN is incorrect' }, 403)
        }
        const newHash = await hashPin(new_pin)
        if (existing) {
          await adminClient.from('transaction_pins').update({ pin_hash: newHash, updated_at: new Date().toISOString() }).eq('user_id', user.id)
        } else {
          await adminClient.from('transaction_pins').insert({ user_id: user.id, pin_hash: newHash })
        }
        return json({ success: true })
      }
      case 'audit_log': {
        const { data: logs, error: logErr } = await adminClient.from('transaction_audit')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false })
          .limit(100)
        if (logErr) return json({ error: logErr.message }, 500)
        return json({ logs })
      }
      default:
        return json({ error: 'Invalid action' }, 400)
    }
  } catch (err) {
    console.error('Admin error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})

async function listUsers(client: any, adminId: string, isSuperAdmin: boolean, isMasterAdmin: boolean) {
  let query = client.from('profiles').select('*')
  
  // SuperAdmin sees all, MasterAdmin sees their downline (admins + users they created)
  if (!isSuperAdmin && !isMasterAdmin) {
    query = query.eq('parent_id', adminId)
  } else if (isMasterAdmin) {
    // MasterAdmin sees users they created + users created by their admins
    const { data: directChildren } = await client.from('profiles').select('id').eq('parent_id', adminId)
    const childIds = directChildren?.map((c: any) => c.id) || []
    const allIds = [adminId, ...childIds]
    query = query.or(`parent_id.in.(${allIds.join(',')})`)
  }

  const { data: profiles, error } = await query.order('created_at', { ascending: false })
  if (error) return json({ error: error.message }, 500)

  // Fetch wallets and roles separately (no FK relationship)
  const userIds = profiles?.map((p: any) => p.id) || []
  
  const { data: wallets } = await client.from('wallets').select('*')
    .in('user_id', userIds)
  const { data: roles } = await client.from('user_roles').select('*')
    .in('user_id', userIds)

  const walletsMap = Object.fromEntries((wallets || []).map((w: any) => [w.user_id, w]))
  const rolesMap = Object.fromEntries((roles || []).map((r: any) => [r.user_id, r]))

  const users = (profiles || []).map((p: any) => ({
    ...p,
    wallets: walletsMap[p.id] ? [walletsMap[p.id]] : [],
    user_roles: rolesMap[p.id] ? [rolesMap[p.id]] : [],
  }))

  return json({ users })
}

async function adjustBalance(client: any, adminId: string, data: any, isSuperAdmin: boolean, isMasterAdmin: boolean) {
  const { user_id, amount, type, transaction_pin } = data
  if (!user_id || !amount || !type) return json({ error: 'Missing params' }, 400)

  // RULE 0: Transaction PIN required
  if (!transaction_pin || transaction_pin.length < 4) {
    return json({ error: 'Transaction PIN is required', need_pin: true }, 400)
  }

  const pinResult = await verifyTransactionPin(client, adminId, transaction_pin)
  if (!pinResult.valid) {
    // Log failed attempt
    await logAudit(client, adminId, user_id, 'adjust_balance', Math.abs(Number(amount)), type, 'failed_pin', { reason: 'Invalid transaction PIN' })
    return json({ error: 'Invalid transaction PIN' }, 403)
  }
  if (!isSuperAdmin && !isMasterAdmin) {
    const { data: profile } = await client.from('profiles').select('parent_id')
      .eq('id', user_id).single()
    if (!profile || profile.parent_id !== adminId) {
      return json({ error: 'Not in your downline' }, 403)
    }
  }

  // Fetch both wallets in parallel
  const [targetWalletRes, adminWalletRes] = await Promise.all([
    client.from('wallets').select('*').eq('user_id', user_id).single(),
    client.from('wallets').select('*').eq('user_id', adminId).single(),
  ])

  const targetWallet = targetWalletRes.data
  const adminWallet = adminWalletRes.data
  if (!targetWallet) return json({ error: 'Target wallet not found' }, 404)
  if (!adminWallet) return json({ error: 'Admin wallet not found' }, 404)

  const amtNum = Math.abs(Number(amount))

  if (type === 'credit') {
    // RULE 3: Admin must have enough balance to give points
    if (adminWallet.balance < amtNum) {
      return json({ error: `Insufficient balance. You have ${adminWallet.balance} points but trying to give ${amtNum}.` }, 400)
    }

    const newTargetBalance = targetWallet.balance + amtNum
    const newAdminBalance = adminWallet.balance - amtNum

    // Update both wallets
    await Promise.all([
      client.from('wallets').update({ balance: newTargetBalance }).eq('user_id', user_id),
      client.from('wallets').update({ balance: newAdminBalance }).eq('user_id', adminId),
    ])

    // Log transactions for both sides
    await Promise.all([
      client.from('transactions').insert({
        user_id,
        type: 'admin_credit',
        amount: amtNum,
        balance_before: targetWallet.balance,
        balance_after: newTargetBalance,
        description: `Points received from ${adminId}`,
        reference_type: 'admin_adjustment',
      }),
      client.from('transactions').insert({
        user_id: adminId,
        type: 'admin_debit',
        amount: amtNum,
        balance_before: adminWallet.balance,
        balance_after: newAdminBalance,
        description: `Points given to ${user_id}`,
        reference_type: 'admin_adjustment',
      }),
    ])

    return json({ success: true, new_balance: newTargetBalance, admin_balance: newAdminBalance })

  } else {
    // Debit: take points from user → return to admin
    const actualDebit = Math.min(amtNum, targetWallet.balance)
    if (actualDebit <= 0) return json({ error: 'User has no balance to debit' }, 400)

    const newTargetBalance = targetWallet.balance - actualDebit
    const newAdminBalance = adminWallet.balance + actualDebit

    await Promise.all([
      client.from('wallets').update({ balance: newTargetBalance }).eq('user_id', user_id),
      client.from('wallets').update({ balance: newAdminBalance }).eq('user_id', adminId),
    ])

    await Promise.all([
      client.from('transactions').insert({
        user_id,
        type: 'admin_debit',
        amount: actualDebit,
        balance_before: targetWallet.balance,
        balance_after: newTargetBalance,
        description: `Points withdrawn by ${adminId}`,
        reference_type: 'admin_adjustment',
      }),
      client.from('transactions').insert({
        user_id: adminId,
        type: 'admin_credit',
        amount: actualDebit,
        balance_before: adminWallet.balance,
        balance_after: newAdminBalance,
        description: `Points received from debit of ${user_id}`,
        reference_type: 'admin_adjustment',
      }),
    ])

    return json({ success: true, new_balance: newTargetBalance, admin_balance: newAdminBalance })
  }
}

async function updateUserStatus(client: any, userId: string, status: string) {
  if (!userId) return json({ error: 'Missing user_id' }, 400)
  const { error } = await client.from('profiles').update({ status }).eq('id', userId)
  if (error) return json({ error: error.message }, 500)
  return json({ success: true, status })
}

async function createUser(client: any, adminId: string, data: any, isSuperAdmin: boolean, isMasterAdmin: boolean) {
  const { email, password, username, role } = data
  const userId = username || email
  if (!userId || !password) return json({ error: 'User ID and password are required' }, 400)
  
  const internalEmail = email?.includes('@') ? email : `${userId.toLowerCase().trim()}@${EMAIL_DOMAIN}`

  // Role creation permissions:
  // SuperAdmin can create: admin, master_admin, user
  // MasterAdmin can create: admin, user
  // Admin can create: user only
  if (role === 'superadmin') {
    return json({ error: 'Cannot create superadmin accounts' }, 403)
  }
  if (role === 'master_admin' && !isSuperAdmin) {
    return json({ error: 'Only SuperAdmin can create Master Admins' }, 403)
  }
  if (role === 'admin' && !isSuperAdmin && !isMasterAdmin) {
    return json({ error: 'Only SuperAdmin or Master Admin can create admins' }, 403)
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

  // Set role if not user (default)
  if (role && role !== 'user') {
    await client.from('user_roles').update({ role }).eq('user_id', newUser.user.id)
  }

  return json({ success: true, user_id: newUser.user.id, username: userId })
}

async function changeRole(client: any, data: any, isSuperAdmin: boolean) {
  const { user_id, new_role } = data
  if (!user_id || !new_role) return json({ error: 'Missing params' }, 400)
  if (new_role === 'superadmin') return json({ error: 'Cannot assign superadmin' }, 403)
  if (new_role === 'master_admin' && !isSuperAdmin) return json({ error: 'Only SuperAdmin can assign Master Admin' }, 403)

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

  // Stake is already deducted at placement, so:
  // Won: return stake + profit
  // Lost: nothing (stake already gone)
  // Void: return stake (refund)
  let profit = 0
  let newBalance = wallet.balance
  const newExposure = Math.max(0, wallet.exposure - bet.exposure)

  if (result === 'won') {
    profit = bet.potential_profit
    newBalance = wallet.balance + bet.stake + profit  // return stake + winnings
  } else if (result === 'lost') {
    profit = -bet.stake
    newBalance = wallet.balance  // stake already deducted, nothing to do
  } else if (result === 'void') {
    profit = 0
    newBalance = wallet.balance + bet.stake  // refund the stake
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

  const txnType = result === 'won' ? 'bet_win' : (result === 'void' ? 'bet_refund' : 'bet_debit')
  const txnAmount = result === 'won' ? (bet.stake + profit) : (result === 'void' ? bet.stake : 0)
  if (txnAmount > 0) {
    await client.from('transactions').insert({
      user_id: bet.user_id,
      type: txnType,
      amount: txnAmount,
      balance_before: wallet.balance,
      balance_after: newBalance,
      description: `Force settle: ${result}`,
      reference_id: bet_id,
      reference_type: 'force_settle',
    })
  }

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
