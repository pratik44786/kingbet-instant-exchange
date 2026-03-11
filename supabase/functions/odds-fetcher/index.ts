import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Diamond Sports API config
const RAPIDAPI_HOST = "diamond-sports-api-d247-sky-exchange-betfair.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

// Sport ID mapping for Diamond Sports API
const SPORT_IDS: Record<string, number> = {
  cricket: 4,
  football: 1,
  tennis: 2,
};

function toUUID(input: string): string {
  const h = input.replace(/[^a-f0-9]/gi, "").padEnd(32, "0").slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function sportFromId(id: number): "cricket" | "football" | "tennis" {
  if (id === 4) return "cricket";
  if (id === 1) return "football";
  if (id === 2) return "tennis";
  return "cricket";
}

async function fetchFromDiamond(path: string, apiKey: string): Promise<any> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });
  if (!resp.ok) {
    throw new Error(`Diamond API error ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

interface DiamondRunner {
  selectionId?: string | number;
  RunnerName?: string;
  runnerName?: string;
  runner_name?: string;
  name?: string;
  BackPrice1?: number;
  backPrice1?: number;
  back_price_1?: number;
  LayPrice1?: number;
  layPrice1?: number;
  lay_price_1?: number;
  BackSize1?: number;
  backSize1?: number;
  back_size_1?: number;
  LaySize1?: number;
  laySize1?: number;
  lay_size_1?: number;
}

function extractRunnerName(r: DiamondRunner): string {
  return r.RunnerName || r.runnerName || r.runner_name || r.name || "Unknown";
}

function extractBackOdds(r: DiamondRunner): number {
  return r.BackPrice1 || r.backPrice1 || r.back_price_1 || 1.5;
}

function extractLayOdds(r: DiamondRunner): number {
  return r.LayPrice1 || r.layPrice1 || r.lay_price_1 || 1.52;
}

function extractBackSize(r: DiamondRunner): number {
  return r.BackSize1 || r.backSize1 || r.back_size_1 || 10000;
}

function extractLaySize(r: DiamondRunner): number {
  return r.LaySize1 || r.laySize1 || r.lay_size_1 || 10000;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // ── Auth + Admin role check ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await userClient.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
    if (!roleData || !["admin", "superadmin"].includes(roleData.role)) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY");
    if (!RAPIDAPI_KEY) {
      return new Response(
        JSON.stringify({ error: "RAPIDAPI_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const sportFilter = url.searchParams.get("sport") || "all";
    const mode = url.searchParams.get("mode") || "sync";

    // Determine which sport IDs to fetch
    const sportsToFetch: { sport: string; sportsId: number }[] = [];
    if (sportFilter === "all") {
      for (const [sport, id] of Object.entries(SPORT_IDS)) {
        sportsToFetch.push({ sport, sportsId: id });
      }
    } else if (SPORT_IDS[sportFilter] !== undefined) {
      sportsToFetch.push({ sport: sportFilter, sportsId: SPORT_IDS[sportFilter] });
    }

    // Fetch match list from Diamond Sports API
    interface MatchEvent {
      gmid?: string | number;
      gameId?: string | number;
      game_id?: string | number;
      eventName?: string;
      event_name?: string;
      matchName?: string;
      match_name?: string;
      competition?: string;
      competitionName?: string;
      competition_name?: string;
      startTime?: string;
      start_time?: string;
      openDate?: string;
      open_date?: string;
      runners?: DiamondRunner[];
      sportsId?: number;
    }

    const allMatches: { match: MatchEvent; sport: string }[] = [];

    for (const { sport, sportsId } of sportsToFetch) {
      try {
        // Try fetching match list for this sport
        const data = await fetchFromDiamond(`/sports/getPriveteData?sportsid=${sportsId}`, RAPIDAPI_KEY);

        // The API may return data in different structures
        const matches: MatchEvent[] = Array.isArray(data) ? data : (data?.data || data?.matches || data?.events || []);

        for (const match of matches) {
          allMatches.push({ match, sport });
        }
      } catch (err) {
        console.error(`Failed to fetch ${sport} (sportsId=${sportsId}):`, err);
      }
    }

    // For each match, try to get detailed odds if we don't have runners
    for (const item of allMatches) {
      const m = item.match;
      if (!m.runners || m.runners.length === 0) {
        const gmid = m.gmid || m.gameId || m.game_id;
        const sportsId = SPORT_IDS[item.sport];
        if (gmid) {
          try {
            const detail = await fetchFromDiamond(`/api/v1/sports/tv?gmid=${gmid}&sportsid=${sportsId}`, RAPIDAPI_KEY);
            const runners = detail?.runners || detail?.data?.runners || detail?.marketOdds?.runners || [];
            if (Array.isArray(runners) && runners.length > 0) {
              m.runners = runners;
            }
          } catch {
            // Skip failed detail fetches
          }
        }
      }
    }

    if (mode === "fetch") {
      const formatted = allMatches.map(({ match: m, sport }) => {
        const eventName = m.eventName || m.event_name || m.matchName || m.match_name || "Unknown Match";
        const competition = m.competition || m.competitionName || m.competition_name || sport.toUpperCase();
        return {
          id: String(m.gmid || m.gameId || m.game_id || ""),
          event_name: eventName,
          sport,
          competition,
          start_time: m.startTime || m.start_time || m.openDate || m.open_date || new Date().toISOString(),
          status: "open",
          runners: (m.runners || []).map((r: DiamondRunner, idx: number) => ({
            name: extractRunnerName(r),
            back_odds: extractBackOdds(r),
            lay_odds: extractLayOdds(r),
            back_size: extractBackSize(r),
            lay_size: extractLaySize(r),
            sort_order: idx,
          })),
        };
      });

      return new Response(JSON.stringify({ events: formatted, count: formatted.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode: sync — upsert events into markets + runners tables
    let upsertedCount = 0;
    for (const { match: m, sport } of allMatches) {
      const gmid = String(m.gmid || m.gameId || m.game_id || "");
      if (!gmid) continue;

      const eventName = m.eventName || m.event_name || m.matchName || m.match_name || "Unknown Match";
      const competition = m.competition || m.competitionName || m.competition_name || sport.toUpperCase();
      const startTime = m.startTime || m.start_time || m.openDate || m.open_date || new Date().toISOString();

      const marketId = toUUID(gmid);

      const { data: market, error: mErr } = await supabase
        .from("markets")
        .upsert(
          {
            id: marketId,
            event_name: eventName,
            sport: sport as "cricket" | "football" | "tennis",
            competition,
            start_time: startTime,
            status: "open",
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();

      if (mErr || !market) continue;

      const runners = m.runners || [];
      if (runners.length === 0) continue;

      const runnersToUpsert = runners.map((r: DiamondRunner, i: number) => {
        const runnerName = extractRunnerName(r);
        const runnerHash = `${market.id}-${runnerName}`.replace(/[^a-z0-9]/gi, "").padEnd(32, "0").slice(0, 32);
        const runnerId = `${runnerHash.slice(0, 8)}-${runnerHash.slice(8, 12)}-${runnerHash.slice(12, 16)}-${runnerHash.slice(16, 20)}-${runnerHash.slice(20, 32)}`;

        return {
          id: runnerId,
          market_id: market.id,
          name: runnerName,
          back_odds: extractBackOdds(r),
          lay_odds: extractLayOdds(r),
          back_size: extractBackSize(r),
          lay_size: extractLaySize(r),
          sort_order: i,
        };
      });

      const { error: rErr } = await supabase
        .from("runners")
        .upsert(runnersToUpsert, { onConflict: "id" });

      if (!rErr) upsertedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: upsertedCount,
        totalFetched: allMatches.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
