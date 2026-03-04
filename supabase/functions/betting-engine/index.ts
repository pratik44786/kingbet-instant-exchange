import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface BetRequest {
  action: 'place_bet' | 'settle_bet' | 'settle_market' | 'cash_out' | 'void_bet'
  data: Record<string, unknown>
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
    if (!authHeader) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? ''
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) {
      return jsonResponse({ error: 'Invalid token' }, 401)
    }

    // Check if user is blocked/suspended
    const { data: profile } = await adminClient.from('profiles').select('status').eq('id', user.id).single()
    if (profile?.status === 'blocked' || profile?.status === 'suspended') {
      return jsonResponse({ error: 'Account is ' + profile.status }, 403)
    }

    const { action, data } = await req.json() as BetRequest

    switch (action) {
      case 'place_bet':
        return await placeBet(adminClient, user.id, data)
      case 'settle_bet':
        return await settleBet(adminClient, user.id, data)
      case 'settle_market':
        return await settleMarket(adminClient, user.id, data)
      case 'cash_out':
        return await cashOut(adminClient, user.id, data)
      case 'void_bet':
        return await voidBet(adminClient, user.id, data)
      default:
        return jsonResponse({ error: 'Invalid action' }, 400)
    }
  } catch (err) {
    console.error('Betting engine error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})

async function placeBet(client: any, userId: string, data: Record<string, unknown>) {
  const { market_id, runner_id, bet_type, odds, stake, game_type, game_round_id } = data as any

  if (!bet_type || !odds || !stake || stake <= 0) {
    return jsonResponse({ error: 'Invalid bet parameters' }, 400)
  }

  const { data: wallet, error: walletErr } = await client
    .from('wallets').select('*').eq('user_id', userId).single()
  if (walletErr || !wallet) {
    return jsonResponse({ error: 'Wallet not found' }, 404)
  }

  const stakeNum = Number(stake)
  const oddsNum = Number(odds)
  let exposure = stakeNum
  let potentialProfit = 0

  if (bet_type === 'back') {
    exposure = stakeNum
    potentialProfit = (stakeNum * oddsNum) - stakeNum
  } else if (bet_type === 'lay') {
    exposure = (stakeNum * oddsNum) - stakeNum
    potentialProfit = stakeNum
  } else {
    exposure = stakeNum
    potentialProfit = (stakeNum * oddsNum) - stakeNum
  }

  const availableBalance = wallet.balance - wallet.exposure
  if (exposure > availableBalance) {
    return jsonResponse({ error: 'Insufficient balance', available: availableBalance }, 400)
  }

  const { data: bet, error: betErr } = await client.from('bets').insert({
    user_id: userId,
    market_id: market_id || null,
    runner_id: runner_id || null,
    game_type: game_type || null,
    game_round_id: game_round_id || null,
    bet_type,
    odds: oddsNum,
    stake: stakeNum,
    potential_profit: potentialProfit,
    exposure,
    status: 'pending',
  }).select().single()

  if (betErr) {
    console.error('Bet insert error:', betErr)
    return jsonResponse({ error: 'Failed to place bet' }, 500)
  }

  const newExposure = wallet.exposure + exposure
  await client.from('wallets').update({ exposure: newExposure }).eq('user_id', userId)

  await client.from('transactions').insert({
    user_id: userId,
    type: 'bet_debit',
    amount: exposure,
    balance_before: wallet.balance,
    balance_after: wallet.balance,
    description: `Bet placed: ${bet_type} @ ${oddsNum}`,
    reference_id: bet.id,
    reference_type: 'bet',
  })

  if (game_type) {
    await client.from('game_logs').insert({
      user_id: userId,
      game: game_type,
      round_id: game_round_id || null,
      bet_id: bet.id,
      action: 'bet_placed',
      details: { stake: stakeNum, odds: oddsNum, bet_type },
    })
  }

  return jsonResponse({
    success: true,
    bet,
    wallet: { balance: wallet.balance, exposure: newExposure, available: wallet.balance - newExposure },
  })
}

async function settleBet(client: any, userId: string, data: Record<string, unknown>) {
  const { data: role } = await client.from('user_roles').select('role')
    .eq('user_id', userId).single()
  if (!role || !['admin', 'superadmin'].includes(role.role)) {
    return jsonResponse({ error: 'Admin access required' }, 403)
  }

  const { bet_id, result } = data as any
  if (!bet_id || !result) return jsonResponse({ error: 'Missing bet_id or result' }, 400)

  const { data: bet } = await client.from('bets').select('*').eq('id', bet_id).single()
  if (!bet) return jsonResponse({ error: 'Bet not found' }, 404)
  if (bet.status !== 'pending' && bet.status !== 'matched') {
    return jsonResponse({ error: 'Bet already settled' }, 400)
  }

  const { data: wallet } = await client.from('wallets').select('*').eq('user_id', bet.user_id).single()
  if (!wallet) return jsonResponse({ error: 'Wallet not found' }, 404)

  let actualProfit = 0
  let newBalance = wallet.balance
  const newExposure = Math.max(0, wallet.exposure - bet.exposure)

  if (result === 'won') {
    actualProfit = bet.potential_profit
    newBalance = wallet.balance + actualProfit
  } else if (result === 'lost') {
    actualProfit = -bet.exposure
    newBalance = wallet.balance - bet.exposure
  }

  await client.from('bets').update({
    status: result === 'void' ? 'void' : (result === 'won' ? 'won' : 'lost'),
    actual_profit: actualProfit,
    settled_at: new Date().toISOString(),
  }).eq('id', bet_id)

  await client.from('wallets').update({
    balance: Math.max(0, newBalance),
    exposure: newExposure,
    total_profit_loss: wallet.total_profit_loss + actualProfit,
  }).eq('user_id', bet.user_id)

  const txnType = result === 'won' ? 'bet_win' : (result === 'void' ? 'bet_refund' : 'bet_debit')
  await client.from('transactions').insert({
    user_id: bet.user_id,
    type: txnType,
    amount: Math.abs(actualProfit) || bet.exposure,
    balance_before: wallet.balance,
    balance_after: Math.max(0, newBalance),
    description: `Bet ${result}: ${bet.bet_type} @ ${bet.odds}`,
    reference_id: bet_id,
    reference_type: 'settlement',
  })

  return jsonResponse({ success: true, bet_id, result, actual_profit: actualProfit })
}

async function settleMarket(client: any, userId: string, data: Record<string, unknown>) {
  const { data: role } = await client.from('user_roles').select('role')
    .eq('user_id', userId).single()
  if (!role || !['admin', 'superadmin'].includes(role.role)) {
    return jsonResponse({ error: 'Admin access required' }, 403)
  }

  const { market_id, winner_runner_id } = data as any
  if (!market_id || !winner_runner_id) return jsonResponse({ error: 'Missing params' }, 400)

  await client.from('runners').update({ is_winner: false }).eq('market_id', market_id)
  await client.from('runners').update({ is_winner: true }).eq('id', winner_runner_id)

  const { data: bets } = await client.from('bets').select('*')
    .eq('market_id', market_id).in('status', ['pending', 'matched'])

  if (!bets || bets.length === 0) {
    await client.from('markets').update({ status: 'settled' }).eq('id', market_id)
    return jsonResponse({ success: true, settled: 0 })
  }

  let settled = 0
  for (const bet of bets) {
    const isWinnerBet = bet.runner_id === winner_runner_id
    let result: string
    if (bet.bet_type === 'back') {
      result = isWinnerBet ? 'won' : 'lost'
    } else if (bet.bet_type === 'lay') {
      result = isWinnerBet ? 'lost' : 'won'
    } else {
      result = isWinnerBet ? 'won' : 'lost'
    }
    await settleBet(client, userId, { bet_id: bet.id, result })
    settled++
  }

  await client.from('markets').update({ status: 'settled' }).eq('id', market_id)
  return jsonResponse({ success: true, settled })
}

async function cashOut(client: any, userId: string, data: Record<string, unknown>) {
  const { bet_id, multiplier } = data as any
  if (!bet_id) return jsonResponse({ error: 'Missing bet_id' }, 400)

  const { data: bet } = await client.from('bets').select('*')
    .eq('id', bet_id).eq('user_id', userId).single()
  if (!bet) return jsonResponse({ error: 'Bet not found' }, 404)
  if (bet.status !== 'pending' && bet.status !== 'matched') {
    return jsonResponse({ error: 'Bet already settled' }, 400)
  }

  const cashOutMultiplier = Number(multiplier) || 1
  const profit = (bet.stake * cashOutMultiplier) - bet.stake

  const { data: wallet } = await client.from('wallets').select('*').eq('user_id', userId).single()
  if (!wallet) return jsonResponse({ error: 'Wallet not found' }, 404)

  const newBalance = wallet.balance + profit
  const newExposure = Math.max(0, wallet.exposure - bet.exposure)

  await client.from('bets').update({
    status: 'won',
    actual_profit: profit,
    settled_at: new Date().toISOString(),
  }).eq('id', bet_id)

  await client.from('wallets').update({
    balance: newBalance,
    exposure: newExposure,
    total_profit_loss: wallet.total_profit_loss + profit,
  }).eq('user_id', userId)

  await client.from('transactions').insert({
    user_id: userId,
    type: 'bet_win',
    amount: profit,
    balance_before: wallet.balance,
    balance_after: newBalance,
    description: `Cash out @ ${cashOutMultiplier}x`,
    reference_id: bet_id,
    reference_type: 'cashout',
  })

  return jsonResponse({ success: true, profit, new_balance: newBalance })
}

async function voidBet(client: any, userId: string, data: Record<string, unknown>) {
  return await settleBet(client, userId, { ...data, result: 'void' })
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
