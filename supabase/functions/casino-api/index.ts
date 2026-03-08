const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Live Casino Slots API (SPRIBE, CREEDROOMZ etc.)
const SLOTS_HOST = 'live-casino-slots-evolution-jili-and-50-plus-provider.p.rapidapi.com';
const SLOTS_BASE = `https://${SLOTS_HOST}`;

// Diamond Casino API (Table games - Baccarat, Roulette etc.)
const DIAMOND_HOST = 'diamond-casino-api-no-ggr.p.rapidapi.com';
const DIAMOND_BASE = `https://${DIAMOND_HOST}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    const { action, data } = await req.json();

    let apiRes: Response;

    switch (action) {
      // ── Live Casino Slots API ──
      case 'get_game_url': {
        apiRes = await fetch(`${SLOTS_BASE}/getgameurl`, {
          method: 'POST',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': SLOTS_HOST,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: data.username || 'user' + Math.random().toString(36).slice(2, 10),
            gameId: data.gameId,
            lang: data.lang || 'en',
            money: data.money || 0,
            home_url: data.home_url || 'https://kingbet-instant-exchange.lovable.app',
            platform: data.platform || 1,
            currency: data.currency || 'INR',
          }),
        });
        break;
      }

      // ── Diamond Casino API ──
      case 'diamond_table_ids': {
        apiRes = await fetch(`${DIAMOND_BASE}/casino/tableid`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': DIAMOND_HOST,
          },
        });
        break;
      }

      case 'diamond_table_data': {
        const tableId = data?.tableId || '';
        apiRes = await fetch(`${DIAMOND_BASE}/casino/tabledata?id=${tableId}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': DIAMOND_HOST,
          },
        });
        break;
      }

      case 'diamond_rules': {
        const type = data?.type || 'baccarat2';
        apiRes = await fetch(`${DIAMOND_BASE}/casino/casinorules?type=${type}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': DIAMOND_HOST,
          },
        });
        break;
      }

      case 'diamond_table_result': {
        const tableId = data?.tableId || '';
        apiRes = await fetch(`${DIAMOND_BASE}/casino/tableresult?id=${tableId}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': DIAMOND_HOST,
          },
        });
        break;
      }

      case 'diamond_table_stream': {
        const tableId = data?.tableId || '';
        apiRes = await fetch(`${DIAMOND_BASE}/casino/tabledetailslivestream?id=${tableId}`, {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': DIAMOND_HOST,
          },
        });
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

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
