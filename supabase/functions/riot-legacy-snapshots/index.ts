import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });

let championNameCache = new Map<number, string>();
let championNameCacheAt = 0;

async function championNames() {
  if (championNameCache.size && Date.now() - championNameCacheAt < 6 * 60 * 60 * 1000) {
    return championNameCache;
  }
  try {
    const versionsRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json", {
      signal: AbortSignal.timeout(4000),
    });
    const versions = versionsRes.ok ? await versionsRes.json() : [];
    const version = Array.isArray(versions) ? String(versions[0] || "") : "";
    if (!version) return championNameCache;
    const championsRes = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${encodeURIComponent(version)}/data/en_US/champion.json`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (!championsRes.ok) return championNameCache;
    const payload = await championsRes.json();
    const next = new Map<number, string>();
    for (const champion of Object.values(payload?.data || {}) as any[]) {
      const id = Number(champion?.key);
      const name = safeText(champion?.name, 40);
      if (Number.isFinite(id) && name) next.set(id, name);
    }
    if (next.size) {
      championNameCache = next;
      championNameCacheAt = Date.now();
    }
  } catch {
    // Mastery names are enrichment only; snapshot capture must keep working.
  }
  return championNameCache;
}

const supportedPlatforms = new Set([
  "br1", "na1", "la1", "la2", "euw1", "eun1", "kr", "jp1",
  "oc1", "tr1", "ru", "ph2", "sg2", "th2", "tw2", "vn2",
]);

function regionFor(platform: string) {
  if (["br1", "na1", "la1", "la2"].includes(platform)) return "americas";
  if (["kr", "jp1"].includes(platform)) return "asia";
  if (["ph2", "sg2", "th2", "tw2", "vn2", "oc1"].includes(platform)) return "sea";
  return "europe";
}

function safeText(value: unknown, max = 32) {
  return String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

async function compactLol(value: any) {
  if (!value || typeof value !== "object") return {};
  const names = await championNames();
  const mastery = (Array.isArray(value.mastery) ? value.mastery.slice(0, 5) : []).map((item: any) => {
    const championId = Number(item?.championId || 0);
    return {
      championId,
      name: names.get(championId) || (championId ? `Champion #${championId}` : "Champion"),
      level: Number(item?.level || 0),
      points: Number(item?.points || 0),
      lastPlayTime: Number(item?.lastPlayTime || 0),
    };
  });
  return {
    player: value.player ?? null,
    ranked: Array.isArray(value.ranked) ? value.ranked.slice(0, 4) : [],
    mastery,
    championSummaries: Array.isArray(value.championSummaries) ? value.championSummaries.slice(0, 5) : [],
    summary: value.summary ?? {},
  };
}

function compactTft(value: any) {
  if (!value || typeof value !== "object") return {};
  const setStats = new Map<string, { matches: number; placements: number[]; wins: number }>();
  for (const match of Array.isArray(value.matches) ? value.matches : []) {
    const setNumber = Number(match?.setNumber || 0);
    const setName = safeText(match?.setName, 64) || (setNumber > 0 ? `Set ${setNumber}` : "TFT");
    const placement = Number(match?.placement || 0);
    const current = setStats.get(setName) || { matches: 0, placements: [], wins: 0 };
    current.matches += 1;
    if (placement >= 1 && placement <= 8) {
      current.placements.push(placement);
      if (placement === 1) current.wins += 1;
    }
    setStats.set(setName, current);
  }

  return {
    player: value.player ?? null,
    ranked: Array.isArray(value.ranked) ? value.ranked.slice(0, 4) : [],
    summary: value.summary ?? {},
    sets: [...setStats.entries()].map(([name, stat]) => ({
      name,
      matches: stat.matches,
      averagePlacement: stat.placements.length
        ? Math.round((stat.placements.reduce((a, b) => a + b, 0) / stat.placements.length) * 100) / 100
        : null,
      top4Rate: stat.placements.length
        ? Math.round(stat.placements.filter((p) => p <= 4).length / stat.placements.length * 100)
        : null,
      wins: stat.wins,
    })),
  };
}

function topSignature(lol: any) {
  const list = Array.isArray(lol?.championSummaries) ? [...lol.championSummaries] : [];
  list.sort((a, b) =>
    Number(b?.games || 0) - Number(a?.games || 0) ||
    Number(b?.avgKda || 0) - Number(a?.avgKda || 0) ||
    String(a?.name || "").localeCompare(String(b?.name || ""))
  );
  return safeText(list[0]?.name, 32);
}

function rankLabel(rows: any[], tft = false) {
  const row = Array.isArray(rows)
    ? rows.find((item) => tft
      ? String(item?.queueType || "").toUpperCase().includes("RANKED")
      : String(item?.queue || "").toUpperCase() === "SOLO/DUO") || rows[0]
    : null;
  if (!row?.tier) return null;
  const lp = Number(tft ? row?.leaguePoints : row?.lp);
  return `${row.tier} ${row.rank || ""}${Number.isFinite(lp) ? ` · ${lp} LP` : ""}`.trim();
}

function buildSummary(lol: any, tft: any) {
  const mastery = Array.isArray(lol?.mastery) ? lol.mastery : [];
  return {
    signatureChampion: topSignature(lol),
    masteryPoints: Number(mastery[0]?.points || 0),
    masteryLevel: Number(mastery[0]?.level || 0),
    lolRank: rankLabel(lol?.ranked || [], false),
    tftRank: rankLabel(tft?.ranked || [], true),
    primaryPosition: safeText(lol?.summary?.primaryPosition || "", 20) || null,
    lolMatches: Number(lol?.summary?.matches || 0),
    lolWinRate: lol?.summary?.winRate == null ? null : Number(lol.summary.winRate),
    tftMatches: Number(tft?.summary?.matches || 0),
    tftTop4Rate: tft?.summary?.top4Rate == null ? null : Number(tft.summary.top4Rate),
    tftAveragePlacement: tft?.summary?.averagePlacement == null ? null : Number(tft.summary.averagePlacement),
  };
}

function monthKey(value: string) {
  return String(value || "").slice(0, 7);
}

function delta(current: any, previous: any, key: string) {
  const a = Number(current?.[key]);
  const b = Number(previous?.[key]);
  return Number.isFinite(a) && Number.isFinite(b) ? Math.round((a - b) * 100) / 100 : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const gameName = safeText(body?.gameName, 16);
  const tagLine = safeText(body?.tagLine, 5).replace(/^#/, "");
  const platform = safeText(body?.platform, 8).toLowerCase();
  if (!gameName || !tagLine || !supportedPlatforms.has(platform)) {
    return json({ error: "invalid_identity" }, 400);
  }

  const url = Deno.env.get("SUPABASE_URL") || "";
  const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!url || !service) return json({ error: "backend_not_configured" }, 503);

  const db = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  const region = regionFor(platform);
  const cacheKey = `${region}:${platform}:${gameName.toLowerCase()}#${tagLine.toLowerCase()}`;

  const { data: cached, error: cacheError } = await db
    .from("riot_player_cache")
    .select("puuid,game_name,tag_line,platform")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (cacheError) return json({ error: "identity_lookup_failed" }, 502);
  if (!cached?.puuid) {
    return json({
      error: "identity_not_cached",
      message: "Load the Riot profile before saving a snapshot.",
    }, 409);
  }

  const lol = await compactLol(body?.lol);
  const tft = compactTft(body?.tft);
  const summary = buildSummary(lol, tft);
  const now = new Date().toISOString();
  const snapshotDate = now.slice(0, 10);

  const { error: writeError } = await db
    .from("riot_legacy_snapshots")
    .upsert({
      puuid: cached.puuid,
      game_name: cached.game_name || gameName,
      tag_line: cached.tag_line || tagLine,
      platform,
      snapshot_date: snapshotDate,
      captured_at: now,
      lol,
      tft,
      summary,
    }, { onConflict: "puuid,platform,snapshot_date" });

  if (writeError) {
    console.error("[riot-legacy-snapshots] write", writeError.message);
    return json({ error: "snapshot_write_failed" }, 502);
  }

  const { data: historyRows, error: historyError } = await db
    .from("riot_legacy_snapshots")
    .select("snapshot_date,captured_at,summary,lol,tft")
    .eq("puuid", cached.puuid)
    .eq("platform", platform)
    .order("snapshot_date", { ascending: false })
    .limit(36);

  if (historyError) {
    console.error("[riot-legacy-snapshots] history", historyError.message);
    return json({ error: "snapshot_history_failed" }, 502);
  }

  const history = Array.isArray(historyRows) ? historyRows : [];
  const current = history[0]?.summary || summary;
  const currentMonth = monthKey(history[0]?.snapshot_date || snapshotDate);
  const previousSnapshot = history[1]?.summary || null;
  const previousMonthRow = history.find((row: any) => monthKey(row?.snapshot_date) < currentMonth) || null;
  const previousMonth = previousMonthRow?.summary || null;

  return json({
    snapshot: history[0] || { snapshot_date: snapshotDate, captured_at: now, summary, lol, tft },
    history,
    comparison: {
      previousSnapshot: previousSnapshot ? {
        masteryPoints: delta(current, previousSnapshot, "masteryPoints"),
        lolWinRate: delta(current, previousSnapshot, "lolWinRate"),
        tftTop4Rate: delta(current, previousSnapshot, "tftTop4Rate"),
        tftAveragePlacement: delta(current, previousSnapshot, "tftAveragePlacement"),
        signatureChanged: previousSnapshot.signatureChampion && current.signatureChampion
          ? previousSnapshot.signatureChampion !== current.signatureChampion
          : false,
        rankChanged: previousSnapshot.lolRank && current.lolRank
          ? previousSnapshot.lolRank !== current.lolRank
          : false,
      } : null,
      previousMonth: previousMonth ? {
        snapshotDate: previousMonthRow.snapshot_date,
        masteryPoints: delta(current, previousMonth, "masteryPoints"),
        lolWinRate: delta(current, previousMonth, "lolWinRate"),
        tftTop4Rate: delta(current, previousMonth, "tftTop4Rate"),
        tftAveragePlacement: delta(current, previousMonth, "tftAveragePlacement"),
        signatureBefore: previousMonth.signatureChampion || null,
        signatureNow: current.signatureChampion || null,
        lolRankBefore: previousMonth.lolRank || null,
        lolRankNow: current.lolRank || null,
        tftRankBefore: previousMonth.tftRank || null,
        tftRankNow: current.tftRank || null,
      } : null,
    },
  });
});
