import { supabase } from '@/integrations/supabase/client';

export const casinoApiService = {
  // ── Diamond Casino APIs ──
  getDiamondTableIds: async () => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'diamond_table_ids', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getDiamondTableData: async (tableId: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'diamond_table_data', data: { tableId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getDiamondTableStream: async (tableId: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'diamond_table_stream', data: { tableId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getDiamondTableResult: async (tableId: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'diamond_table_result', data: { tableId } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getGameUrl: async (gameId: string, username?: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: {
        action: 'get_game_url',
        data: {
          gameId,
          username: username || 'user' + Math.random().toString(36).slice(2, 10),
          lang: 'en',
          money: 0,
          currency: 'INR',
          platform: 1,
        },
      },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // ── Bigdaddy / TurnkeyXGaming APIs ──

  getAllIds: async () => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_get_all_id', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // Wingo
  getWingoResult: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_wingo', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getWingoData: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_wingo_data', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // TRX
  getTRXResult: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_trx_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getTRXData: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_trx_data', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getTRXWingoResult: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_trx_wingo_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // 5D
  get5DResult: async (type: string = '5') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_5d_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  get5DData: async (type: string = '5') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_5d_data', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  // K3 (NEW)
  getK3Data: async (id: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_k3_data', data: { id } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getK3Result: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_k3_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
