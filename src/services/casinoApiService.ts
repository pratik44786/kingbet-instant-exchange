import { supabase } from '@/integrations/supabase/client';

export const casinoApiService = {
  getGameList: async (provider?: string, type?: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_game_list', data: { provider, type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getProviders: async () => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_providers', data: {} },
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

  // Bigdaddy / GoaGames / Tiranga APIs
  get5DResult: async (type: string = '5') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_5d_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getWingoResult: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_wingo', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getTRXResult: async (type: string = '1') => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_trx_result', data: { type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getAllIds: async () => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'bd_get_all_id', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
