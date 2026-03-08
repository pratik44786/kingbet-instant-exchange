import { supabase } from '@/integrations/supabase/client';

export const casinoApiService = {
  getAllTables: async () => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_all_tables', data: {} },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getTableData: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_table_data', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getResult: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_result', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getDetailResult: async (mid: string, type?: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_detail_result', data: { mid, type } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getTableRules: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_table_rules', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getStreamUrl: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_stream_url', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getVirtualTableData: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_virtual_table_data', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },

  getVirtualResult: async (mid: string) => {
    const { data, error } = await supabase.functions.invoke('casino-api', {
      body: { action: 'get_virtual_result', data: { mid } },
    });
    if (error) throw new Error(error.message);
    return data;
  },
};
