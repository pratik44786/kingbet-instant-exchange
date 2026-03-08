import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RAPIDAPI_HOST = 'diamond-casino-api-no-ggr.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, data } = await req.json();
    const headers = {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    };

    let url = '';
    switch (action) {
      case 'get_all_tables':
        url = `${BASE_URL}/casino/getAllCasinoTableIdTTime`;
        break;
      case 'get_table_data':
        url = `${BASE_URL}/casino/getCasinoTableData5Sec?mid=${data.mid}`;
        break;
      case 'get_result':
        url = `${BASE_URL}/casino/casinoResult5Sec?mid=${data.mid}`;
        break;
      case 'get_detail_result':
        url = `${BASE_URL}/casino/detail_result?mid=${data.mid}&type=${data.type || ''}`;
        break;
      case 'get_table_rules':
        url = `${BASE_URL}/casino/getCasinoTableRules1Time?mid=${data.mid}`;
        break;
      case 'get_stream_url':
        url = `${BASE_URL}/casino/getCasinoStreamUrlUserCall?mid=${data.mid}`;
        break;
      case 'get_virtual_table_data':
        url = `${BASE_URL}/casino/getVirtualCasinoTableDetail5Sec?mid=${data.mid}`;
        break;
      case 'get_virtual_result':
        url = `${BASE_URL}/casino/getVirtualCasinoResult5Sec?mid=${data.mid}`;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const apiRes = await fetch(url, { headers });
    const apiData = await apiRes.json();

    return new Response(JSON.stringify(apiData), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Casino API error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
