const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RAPIDAPI_HOST = 'live-casino-slots-evolution-jili-and-50-plus-provider.p.rapidapi.com';
const BASE_URL = `https://${RAPIDAPI_HOST}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDAPI_KEY = Deno.env.get('RAPIDAPI_KEY');
    if (!RAPIDAPI_KEY) throw new Error('RAPIDAPI_KEY not configured');

    const { action, data } = await req.json();

    const headers: Record<string, string> = {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
      'Content-Type': 'application/json',
    };

    let apiRes: Response;

    switch (action) {
      case 'get_game_url': {
        // POST /getgameurl - Launch a game
        apiRes = await fetch(`${BASE_URL}/getgameurl`, {
          method: 'POST',
          headers,
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

      case 'get_game_list': {
        // GET /getgamelist - Fetch all available games
        const params = new URLSearchParams();
        if (data?.provider) params.set('provider', data.provider);
        if (data?.type) params.set('type', data.type);
        const qs = params.toString();
        apiRes = await fetch(`${BASE_URL}/getgamelist${qs ? '?' + qs : ''}`, {
          method: 'GET',
          headers,
        });
        break;
      }

      case 'get_providers': {
        // GET /getproviders - Fetch provider list
        apiRes = await fetch(`${BASE_URL}/getproviders`, {
          method: 'GET',
          headers,
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
