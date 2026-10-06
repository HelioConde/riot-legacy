const allowedOrigins = new Set([
  "https://helioconde.github.io",
  "http://127.0.0.1:4173",
  "http://localhost:4173",
]);

const allowedRouting = new Set(["americas", "europe", "asia"]);

function cors(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (origin && allowedOrigins.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(
  status: number,
  body: Record<string, unknown>,
  origin: string | null,
  extraHeaders: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors(origin),
      ...extraHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function clean(value: unknown, max: number) {
  return typeof value === "string"
    ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max)
    : "";
}

function validGameName(value: string) {
  return value.length >= 3 && value.length <= 16 && !value.includes("#");
}

function validTagLine(value: string) {
  return /^[\p{L}\p{N}]{3,5}$/u.test(value);
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (request.method !== "POST") return json(405, { error: "method_not_allowed" }, origin);
  if (origin && !allowedOrigins.has(origin)) return json(403, { error: "origin_not_allowed" }, origin);

  let input: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json(400, { error: "invalid_request" }, origin);
    }
    input = parsed as Record<string, unknown>;
  } catch {
    return json(400, { error: "invalid_request" }, origin);
  }

  const gameName = clean(input.gameName, 16);
  const tagLine = clean(input.tagLine, 5).replace(/^#/, "");
  const routing = clean(input.routing, 12).toLowerCase();

  if (!validGameName(gameName) || !validTagLine(tagLine) || !allowedRouting.has(routing)) {
    return json(400, { error: "invalid_riot_id" }, origin);
  }

  const apiKey = Deno.env.get("RIOT_API_KEY");
  if (!apiKey) return json(503, { error: "backend_not_configured" }, origin);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);

  let riotResponse: Response;
  try {
    const url =
      `https://${routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    riotResponse = await fetch(url, {
      headers: { "X-Riot-Token": apiKey },
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timer);
    return json(
      error instanceof DOMException && error.name === "AbortError" ? 504 : 502,
      { error: error instanceof DOMException && error.name === "AbortError" ? "riot_timeout" : "riot_unavailable" },
      origin,
    );
  }
  clearTimeout(timer);

  if (riotResponse.status === 404) return json(404, { error: "account_not_found" }, origin);
  if (riotResponse.status === 429) {
    const retryAfter = riotResponse.headers.get("retry-after") || "60";
    return json(429, { error: "rate_limited", retryAfter }, origin, { "Retry-After": retryAfter });
  }
  if (riotResponse.status === 401 || riotResponse.status === 403) {
    return json(503, { error: "riot_key_unavailable" }, origin);
  }
  if (!riotResponse.ok) {
    return json(502, { error: "riot_unavailable", upstreamStatus: riotResponse.status }, origin);
  }

  let account: Record<string, unknown>;
  try {
    account = await riotResponse.json();
  } catch {
    return json(502, { error: "riot_invalid_payload" }, origin);
  }

  const returnedGameName = clean(account.gameName, 16) || gameName;
  const returnedTagLine = clean(account.tagLine, 5) || tagLine;

  return json(200, {
    source: "riot",
    verified: true,
    dataState: "identity-only",
    account: {
      gameName: returnedGameName,
      tagLine: returnedTagLine,
    },
    routing,
    fetchedAt: new Date().toISOString(),
  }, origin);
});
