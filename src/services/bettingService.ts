import { supabase } from '@/integrations/supabase/client';

const EMAIL_DOMAIN = 'kingbet.local';

export const bettingService = {
  placeBet: async (params: {
    market_id?: string;
    runner_id?: string;
    bet_type: string;
    odds: number;
    stake: number;
    game_type?: string;
    game_round_id?: string;
  }) => {
    const { data, error } = await supabase.functions.invoke('betting-engine', {
      body: { action: 'place_bet', data: params },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  cashOut: async (betId: string, multiplier: number) => {
    const { data, error } = await supabase.functions.invoke('betting-engine', {
      body: { action: 'cash_out', data: { bet_id: betId, multiplier } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  settleMarket: async (marketId: string, winnerRunnerId: string) => {
    const { data, error } = await supabase.functions.invoke('betting-engine', {
      body: { action: 'settle_market', data: { market_id: marketId, winner_runner_id: winnerRunnerId } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },
};

export const adminService = {
  listUsers: async () => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'list_users', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  adjustBalance: async (userId: string, amount: number, type: 'credit' | 'debit', transactionPin: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'adjust_balance', data: { user_id: userId, amount, type, transaction_pin: transactionPin } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  blockUser: async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'block_user', data: { user_id: userId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  unblockUser: async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'unblock_user', data: { user_id: userId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  createUser: async (userId: string, password: string, username: string, role?: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'create_user', data: { email: `${userId.toLowerCase().trim()}@${EMAIL_DOMAIN}`, password, username: username || userId, role: role || 'user' } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  changeRole: async (userId: string, newRole: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'change_role', data: { user_id: userId, new_role: newRole } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  listBets: async (filters?: { user_id?: string; status?: string; market_id?: string }) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'list_bets', data: filters || {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  forceSettle: async (betId: string, result: 'won' | 'lost' | 'void') => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'force_settle', data: { bet_id: betId, result } },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  },

  platformSummary: async () => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'platform_summary', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  pnlReport: async (period: string, userId?: string) => {
    const { data, error } = await supabase.functions.invoke('admin-controls', {
      body: { action: 'pnl_report', data: { period, user_id: userId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
