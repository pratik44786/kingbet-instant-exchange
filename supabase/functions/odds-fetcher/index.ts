import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BETNEX_BASE = "https://stagediamondfeeds.betnex.co:9001/api/v1";

const SPORT_IDS: Record<string, number> = {
  cricket: 4,
  football: 1,
  tennis: 2,
};

function sportFromId(id: number): "cricket" | "football" | "tennis" {
  if (id === 1) return "football";
  if (id === 2) return "tennis";
  return "cricket";
}

function toUUID(input: string): string {
  const h = input.replace(/[^a-f0-9]/gi, "").padEnd(32, "0").slice(0, 32);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

async function callBetnex(path: string, apiKey: string): Promise<any> {
  const resp = await fetch(`${BETNEX_BASE}${path}`, {
    headers: { "x-betnex-key": apiKey },
  });
  if (!resp.ok) {
    throw new Error(`Betnex API ${resp.status}: ${await resp.text()}`);
  }
  return resp.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Auth + Admin check
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

    const BETNEX_KEY = Deno.env.get("BETNEX_API_KEY");
    if (!BETNEX_KEY) {
      return new Response(JSON.stringify({ error: "BETNEX_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const sportFilter = url.searchParams.get("sport") || "all";
    const mode = url.searchParams.get("mode") || "sync";

    // Determine which sports to fetch
    const sportsToFetch: { sport: string; sportsId: number }[] = [];
    if (sportFilter === "all") {
      for (const [sport, id] of Object.entries(SPORT_IDS)) {
        sportsToFetch.push({ sport, sportsId: id });
      }
    } else if (SPORT_IDS[sportFilter] !== undefined) {
      sportsToFetch.push({ sport: sportFilter, sportsId: SPORT_IDS[sportFilter] });
    }

    interface MatchEvent {
      gmid?: string | number;
      eventName?: string;
      event_name?: string;
      matchName?: string;
      competition?: string;
      competitionName?: string;
      startTime?: string;
      start_time?: string;
      openDate?: string;
      runners?: any[];
      sportsId?: number;
    }

    const allMatches: { match: MatchEvent; sport: string }[] = [];

    for (const { sport, sportsId } of sportsToFetch) {
      try {
        const data = await callBetnex(`/sports/matches?sportsid=${sportsId}`, BETNEX_KEY);
        // Betnex returns { data: { t1: [...] } }
        const t1 = data?.data?.t1 || data?.t1 || [];
        const matches: MatchEvent[] = t1.map((m: any) => ({
          gmid: m.gmid,
          eventName: m.ename,
          competition: m.cname,
          startTime: m.stime ? new Date(m.stime).toISOString() : new Date().toISOString(),
          runners: (m.section || []).map((s: any) => {
            const back = s.odds?.find((o: any) => o.otype === 'back') || { odds: 0, size: 0 };
            const lay = s.odds?.find((o: any) => o.otype === 'lay') || { odds: 0, size: 0 };
            return { RunnerName: s.nat, BackPrice1: back.odds, LayPrice1: lay.odds, BackSize1: back.size, LaySize1: lay.size };
          }),
        }));
        for (const match of matches) {
          allMatches.push({ match, sport });
        }
      } catch (err) {
        console.error(`Failed to fetch ${sport}:`, err);
      }
    }

    // For matches, try to get live odds
    for (const item of allMatches) {
      const m = item.match;
      if (!m.runners || m.runners.length === 0) {
        const gmid = m.gmid;
        if (gmid) {
          try {
            const detail = await callBetnex(`/sports/odds?sportsid=${SPORT_IDS[item.sport]}&gmid=${gmid}`, BETNEX_KEY);
            const runners = detail?.runners || detail?.data?.runners || [];
            if (Array.isArray(runners) && runners.length > 0) {
              m.runners = runners;
            }
          } catch { /* skip */ }
        }
      }
    }

    if (mode === "fetch") {
      const formatted = allMatches.map(({ match: m, sport }) => {
        const eventName = m.eventName || m.event_name || m.matchName || "Unknown Match";
        const competition = m.competition || m.competitionName || sport.toUpperCase();
        return {
          id: String(m.gmid || ""),
          event_name: eventName,
          sport,
          competition,
          start_time: m.startTime || m.start_time || m.openDate || new Date().toISOString(),
          status: "open",
          runners: (m.runners || []).map((r: any, idx: number) => ({
            name: r.RunnerName || r.runnerName || r.name || "Unknown",
            back_odds: r.BackPrice1 || r.backPrice1 || 1.5,
            lay_odds: r.LayPrice1 || r.layPrice1 || 1.52,
            back_size: r.BackSize1 || r.backSize1 || 10000,
            lay_size: r.LaySize1 || r.laySize1 || 10000,
            sort_order: idx,
          })),
        };
      });
      return new Response(JSON.stringify({ events: formatted, count: formatted.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Sync mode: upsert into markets + runners
    let upsertedCount = 0;
    for (const { match: m, sport } of allMatches) {
      const gmid = String(m.gmid || "");
      if (!gmid) continue;

      const eventName = m.eventName || m.event_name || m.matchName || "Unknown Match";
      const competition = m.competition || m.competitionName || sport.toUpperCase();
      const startTime = m.startTime || m.start_time || m.openDate || new Date().toISOString();
      const marketId = toUUID(gmid);

      const { data: market, error: mErr } = await supabase
        .from("markets")
        .upsert({ id: marketId, event_name: eventName, sport: sport as any, competition, start_time: startTime, status: "open" }, { onConflict: "id" })
        .select("id")
        .single();

      if (mErr || !market) continue;

      const runners = m.runners || [];
      if (runners.length === 0) continue;

      const runnersToUpsert = runners.map((r: any, i: number) => {
        const runnerName = r.RunnerName || r.runnerName || r.name || "Unknown";
        const hash = `${market.id}-${runnerName}`.replace(/[^a-z0-9]/gi, "").padEnd(32, "0").slice(0, 32);
        const runnerId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
        return {
          id: runnerId,
          market_id: market.id,
          name: runnerName,
          back_odds: r.BackPrice1 || r.backPrice1 || 1.5,
          lay_odds: r.LayPrice1 || r.layPrice1 || 1.52,
          back_size: r.BackSize1 || r.backSize1 || 10000,
          lay_size: r.LaySize1 || r.laySize1 || 10000,
          sort_order: i,
        };
      });

      const { error: rErr } = await supabase.from("runners").upsert(runnersToUpsert, { onConflict: "id" });
      if (!rErr) upsertedCount++;
    }

    return new Response(JSON.stringify({ success: true, synced: upsertedCount, totalFetched: allMatches.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
