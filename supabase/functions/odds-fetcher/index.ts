import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Sport key mapping for The Odds API
const SPORT_KEYS: Record<string, string[]> = {
  cricket: [
    "cricket_ipl",
    "cricket_test_match",
    "cricket_odi",
    "cricket_t20_intl",
    "cricket_big_bash",
    "cricket_psl",
  ],
  football: [
    "soccer_epl",
    "soccer_spain_la_liga",
    "soccer_italy_serie_a",
    "soccer_germany_bundesliga",
    "soccer_france_ligue_one",
    "soccer_uefa_champs_league",
  ],
  tennis: [
    "tennis_atp_french_open",
    "tennis_atp_wimbledon",
    "tennis_atp_us_open",
    "tennis_atp_aus_open",
  ],
};

interface OddsEvent {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

function sportFromKey(key: string): "cricket" | "football" | "tennis" {
  if (key.startsWith("cricket")) return "cricket";
  if (key.startsWith("soccer")) return "football";
  if (key.startsWith("tennis")) return "tennis";
  return "cricket";
}

function competitionFromKey(key: string): string {
  const map: Record<string, string> = {
    cricket_ipl: "IPL 2026",
    cricket_test_match: "Test Series",
    cricket_odi: "ODI Series",
    cricket_t20_intl: "T20 International",
    cricket_big_bash: "Big Bash League",
    cricket_psl: "PSL",
    soccer_epl: "Premier League",
    soccer_spain_la_liga: "La Liga",
    soccer_italy_serie_a: "Serie A",
    soccer_germany_bundesliga: "Bundesliga",
    soccer_france_ligue_one: "Ligue 1",
    soccer_uefa_champs_league: "Champions League",
    tennis_atp_french_open: "French Open",
    tennis_atp_wimbledon: "Wimbledon",
    tennis_atp_us_open: "US Open",
    tennis_atp_aus_open: "Australian Open",
  };
  return map[key] || key;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ODDS_API_KEY = Deno.env.get("ODDS_API_KEY");
    if (!ODDS_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ODDS_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const sportFilter = url.searchParams.get("sport") || "all";
    const mode = url.searchParams.get("mode") || "sync"; // "sync" = upsert to DB, "fetch" = return directly

    // Determine which sport keys to fetch
    let sportKeys: string[] = [];
    if (sportFilter === "all") {
      sportKeys = [...SPORT_KEYS.cricket, ...SPORT_KEYS.football, ...SPORT_KEYS.tennis];
    } else if (SPORT_KEYS[sportFilter]) {
      sportKeys = SPORT_KEYS[sportFilter];
    }

    // Fetch odds from The Odds API (batch by sport key to save credits)
    // We'll fetch h2h (moneyline) odds
    const allEvents: OddsEvent[] = [];
    const uniqueSportGroups = sportFilter === "all"
      ? ["cricket", "football", "tennis"]
      : [sportFilter];

    for (const group of uniqueSportGroups) {
      const keys = SPORT_KEYS[group] || [];
      for (const sportKey of keys) {
        try {
          const apiUrl = `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=uk&markets=h2h&oddsFormat=decimal`;
          const resp = await fetch(apiUrl);
          if (resp.ok) {
            const events: OddsEvent[] = await resp.json();
            allEvents.push(...events);
          }
          // If 404 or no events for this sport, just skip
        } catch {
          // Skip failed fetches
        }
      }
    }

    if (mode === "fetch") {
      // Return data directly without DB upsert
      const formatted = allEvents.map((ev) => ({
        id: ev.id,
        event_name: `${ev.home_team} vs ${ev.away_team}`,
        sport: sportFromKey(ev.sport_key),
        competition: competitionFromKey(ev.sport_key),
        start_time: ev.commence_time,
        status: new Date(ev.commence_time) <= new Date() ? "open" : "open",
        runners: (() => {
          const bm = ev.bookmakers?.[0];
          const h2h = bm?.markets?.find((m) => m.key === "h2h");
          if (!h2h) return [];
          return h2h.outcomes.map((o, idx) => ({
            name: o.name,
            back_odds: o.price,
            lay_odds: +(o.price + 0.02).toFixed(2),
            back_size: Math.floor(Math.random() * 50000) + 10000,
            lay_size: Math.floor(Math.random() * 50000) + 10000,
            sort_order: idx,
          }));
        })(),
      }));

      return new Response(JSON.stringify({ events: formatted, count: formatted.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mode: sync — upsert events into markets + runners tables
    let upsertedCount = 0;
    for (const ev of allEvents) {
      const sport = sportFromKey(ev.sport_key);
      const eventName = `${ev.home_team} vs ${ev.away_team}`;
      const competition = competitionFromKey(ev.sport_key);

      // Generate deterministic UUID from event ID
      const marketId = toUUID(ev.id);

      // Upsert market
      const { data: market, error: mErr } = await supabase
        .from("markets")
        .upsert(
          {
            id: marketId,
            event_name: eventName,
            sport,
            competition,
            start_time: ev.commence_time,
            status: "open",
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();

      if (mErr || !market) continue;

      // Extract runners from first bookmaker's h2h market
      const bm = ev.bookmakers?.[0];
      const h2h = bm?.markets?.find((m) => m.key === "h2h");
      if (!h2h) continue;

      // Delete old runners for this market, then insert fresh
      await supabase.from("runners").delete().eq("market_id", market.id);

      const runnersToInsert = h2h.outcomes.map((outcome, i) => ({
        market_id: market.id,
        name: outcome.name,
        back_odds: outcome.price,
        lay_odds: +(outcome.price + 0.02).toFixed(2),
        back_size: Math.floor(Math.random() * 50000) + 10000,
        lay_size: Math.floor(Math.random() * 50000) + 10000,
        sort_order: i,
      }));

      await supabase.from("runners").insert(runnersToInsert);
      upsertedCount++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        synced: upsertedCount,
        totalFetched: allEvents.length,
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
