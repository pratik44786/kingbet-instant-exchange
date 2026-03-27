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

// Bigdaddy / GoaGames / Tiranga / 91Club API (5D, Wingo, TRX, K3 etc.)
// Direct TurnkeyXGaming server (preferred) or RapidAPI fallback
const BIGDADDY_HOST = 'bigdaddy-goagames-tiranga-91club-trx-api-with-result.p.rapidapi.com';
const BIGDADDY_BASE = `https://${BIGDADDY_HOST}`;
const TURNKEY_BASE = 'http://local.turnkeyxgaming.com:8002';

/** Helper: call Diamond Casino endpoints via RapidAPI (TurnkeyXGaming local server is not accessible from edge functions) */
function callDiamondEndpoint(
  path: string,
  _turnkeyKey: string | undefined,
  rapidApiKey: string | undefined,
): Promise<Response> {
  if (!rapidApiKey) throw new Error('No API key configured for Diamond Casino');
  const url = `${DIAMOND_BASE}${path}`;
  return fetch(url, {
    method: 'GET',
    headers: {
      'x-rapidapi-key': rapidApiKey,
      'x-rapidapi-host': DIAMOND_HOST,
    },
  });
}

async function callBigdaddyEndpoint(
  path: string,
  turnkeyKey: string | undefined,
  rapidApiKey: string,
): Promise<Response> {
  // Prefer direct TurnkeyXGaming server if key is configured
  if (turnkeyKey) {
    return fetch(`${TURNKEY_BASE}${path}`, {
      method: 'GET',
      headers: {
        'x-turnkeyxgaming-key': turnkeyKey,
        'Content-Type': 'application/json',
      },
    });
  }

  // Fallback to RapidAPI
  return fetch(`${BIGDADDY_BASE}${path}`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': BIGDADDY_HOST,
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    const TURNKEY_KEY = Deno.env.get('TURNKEY_XGAMING_KEY');

    if (!RAPIDAPI_KEY && !TURNKEY_KEY) {
      throw new Error('Neither TURNKEY_XGAMING_KEY nor RAPIDAPI_KEY configured');
    }

    const { action, data } = await req.json();

    let apiRes: Response;

    switch (action) {
      // ── Live Casino Slots API ──
      case 'get_game_url': {
        if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY required for slots');
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
            home_url: data.home_url || 'https://kingbetexchange.com',
            platform: data.platform || 1,
            currency: data.currency || 'INR',
          }),
        });
        break;
      }

      // ── Diamond Casino API (via TurnkeyXGaming or RapidAPI) ──
      case 'diamond_table_ids': {
        apiRes = await callDiamondEndpoint('/api/v1/casino/tables', TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      case 'diamond_table_data': {
        const tableId = data?.tableId || '';
        apiRes = await callDiamondEndpoint(`/api/v1/casino/data?tableid=${tableId}`, TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      case 'diamond_rules': {
        const tableId = data?.tableId || data?.type || 'baccarat2';
        apiRes = await callDiamondEndpoint(`/api/v1/casino/rules?tableid=${tableId}`, TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      case 'diamond_table_result': {
        const tableId = data?.tableId || '';
        apiRes = await callDiamondEndpoint(`/api/v1/casino/result?tableid=${tableId}`, TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      case 'diamond_details_result': {
        const tableId = data?.tableId || '';
        apiRes = await callDiamondEndpoint(`/api/v1/casino/detailsresult?tableid=${tableId}`, TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      case 'diamond_table_stream': {
        const tableId = data?.tableId || '';
        apiRes = await callDiamondEndpoint(`/api/v1/casino/stream?tableid=${tableId}`, TURNKEY_KEY, RAPIDAPI_KEY);
        break;
      }

      // ── Bigdaddy / GoaGames / Tiranga API (via TurnkeyXGaming or RapidAPI) ──
      case 'bd_get_all_id': {
        apiRes = await callBigdaddyEndpoint('/api/v1/getallid', TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }

      // Wingo
      case 'bd_wingo': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/wingo/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }
      case 'bd_wingo_data': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/wingodata/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }

      // TRX
      case 'bd_trx_result': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/trxresult/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }
      case 'bd_trx_data': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/trxdata/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }
      case 'bd_trx_wingo_result': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/trxwingoresult/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }

      // 5D
      case 'bd_5d_result': {
        const type = data?.type || '5';
        apiRes = await callBigdaddyEndpoint(`/api/v1/5dresult/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }
      case 'bd_5d_data': {
        const type = data?.type || '5';
        apiRes = await callBigdaddyEndpoint(`/api/v1/5ddata/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }

      // K3 (NEW)
      case 'bd_k3_data': {
        const id = data?.id || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/k3data/id/${id}`, TURNKEY_KEY, RAPIDAPI_KEY!);
        break;
      }
      case 'bd_k3_result': {
        const type = data?.type || '1';
        apiRes = await callBigdaddyEndpoint(`/api/v1/k3result/type/${type}`, TURNKEY_KEY, RAPIDAPI_KEY!);
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
