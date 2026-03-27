import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BETNEX_BASE = "https://stagediamondfeeds.betnex.co:9001/api/v1";

async function callBetnex(path: string, apiKey: string): Promise<any> {
  const resp = await fetch(`${BETNEX_BASE}${path}`, {
    headers: { "x-betnex-key": apiKey },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Betnex API ${resp.status}: ${text}`);
  }
  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: any logged-in user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BETNEX_KEY = Deno.env.get("BETNEX_API_KEY");
    if (!BETNEX_KEY) {
      return new Response(JSON.stringify({ error: "BETNEX_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";
    const sportsid = url.searchParams.get("sportsid") || "4";
    const gmid = url.searchParams.get("gmid") || "";

    let result: any;

    switch (action) {
      case "sports":
        result = await callBetnex("/sports", BETNEX_KEY);
        break;

      case "matches":
        result = await callBetnex(`/sports/matches?sportsid=${sportsid}`, BETNEX_KEY);
        break;

      case "odds":
        result = await callBetnex(`/sports/odds?sportsid=${sportsid}&gmid=${gmid}`, BETNEX_KEY);
        break;

      case "tv":
        result = await callBetnex(`/sports/tv?sportsid=${sportsid}&gmid=${gmid}`, BETNEX_KEY);
        break;

      case "score":
        result = await callBetnex(`/sports/score?sportsid=${sportsid}&gmid=${gmid}`, BETNEX_KEY);
        break;

      case "result":
        result = await callBetnex(`/posted-market-result?sportsid=${sportsid}&gmid=${gmid}`, BETNEX_KEY);
        break;

      default:
        return new Response(JSON.stringify({ error: "Unknown action. Use: sports, matches, odds, tv, score, result" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Sports data error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
