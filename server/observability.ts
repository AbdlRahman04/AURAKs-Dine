import type { Express, Request, Response, NextFunction } from "express";

const MAX_REQUESTS = 5000;
const MAX_CLIENT_EVENTS = 3000;
const MAX_INCIDENTS = 200;
const SLOW_REQUEST_MS = 1000;
const startedAt = Date.now();

type RequestSample = {
  at: number;
  method: string;
  route: string;
  status: number;
  durationMs: number;
};

type ClientSample = {
  at: number;
  page: string;
  kind: "page_load" | "client_error";
  event?: string;
  durationMs?: number;
};

type Incident = {
  at: number;
  level: "error" | "warning";
  source: "api" | "browser";
  route: string;
  status?: number;
  message: string;
};

const requests: RequestSample[] = [];
const clientSamples: ClientSample[] = [];
const incidents: Incident[] = [];
let lastTelemetryRequestAt = 0;

function pushBounded<T>(list: T[], item: T, max: number) {
  list.push(item);
  if (list.length > max) list.splice(0, list.length - max);
}

function safeRoute(path: string) {
  return path
    .split("/")
    .map((segment) => {
      if (/^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(segment) || /^[a-z0-9_-]{32,}$/i.test(segment)) return ":id";
      return segment;
    })
    .join("/") || "/";
}

export function observeRequests(app: Express) {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const started = Date.now();
    res.on("finish", () => {
      if (!req.path.startsWith("/api") || req.path === "/api/observability/events") return;
      const durationMs = Date.now() - started;
      const route = safeRoute(String(req.route?.path ?? req.path));
      const sample = { at: Date.now(), method: req.method, route, status: res.statusCode, durationMs };
      pushBounded(requests, sample, MAX_REQUESTS);

      if (res.statusCode >= 500 || durationMs >= SLOW_REQUEST_MS) {
        pushBounded(incidents, {
          at: sample.at,
          level: res.statusCode >= 500 ? "error" : "warning",
          source: "api",
          route: `${req.method} ${route}`,
          status: res.statusCode,
          message: res.statusCode >= 500 ? "Request failed with a server error" : `Slow request (${durationMs} ms)`,
        }, MAX_INCIDENTS);
      }
    });
    next();
  });
}

const allowedPages = new Set([
  "/", "/menu", "/login", "/register", "/checkout", "/orders", "/notifications",
  "/favorites", "/profile", "/feedback", "/admin", "/admin/menu", "/admin/orders",
  "/admin/feedback", "/admin/users", "/admin/analytics", "/admin/monitoring",
]);
const allowedClientErrors = new Set(["script_error", "unhandled_rejection", "resource_error"]);

export function recordClientTelemetry(req: Request, res: Response) {
  const body = req.body as Record<string, unknown> | undefined;
  const page = body?.page;
  const kind = body?.kind;
  if (typeof page !== "string" || !allowedPages.has(page) || (kind !== "page_load" && kind !== "client_error")) {
    return res.status(400).json({ message: "Invalid telemetry event" });
  }

  if (kind === "page_load") {
    const durationMs = body?.durationMs;
    if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0 || durationMs > 60000) {
      return res.status(400).json({ message: "Invalid page timing" });
    }
    pushBounded(clientSamples, { at: Date.now(), page, kind, durationMs: Math.round(durationMs) }, MAX_CLIENT_EVENTS);
  } else {
    const event = body?.event;
    if (typeof event !== "string" || !allowedClientErrors.has(event)) {
      return res.status(400).json({ message: "Invalid client error type" });
    }
    const at = Date.now();
    pushBounded(clientSamples, { at, page, kind, event }, MAX_CLIENT_EVENTS);
    pushBounded(incidents, { at, level: "error", source: "browser", route: page, message: `Browser ${event.replaceAll("_", " ")}` }, MAX_INCIDENTS);
  }
  return res.status(202).end();
}

export function limitTelemetry(_req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  if (now - lastTelemetryRequestAt < 25) return res.status(429).json({ message: "Please wait before sending another event" });
  lastTelemetryRequestAt = now;
  next();
}

function percentile(values: number[], value: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
}

export function getObservabilitySnapshot() {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const recentRequests = requests.filter((sample) => sample.at >= windowStart);
  const recentPages = clientSamples.filter((sample) => sample.at >= windowStart && sample.kind === "page_load");
  const apiGroups = new Map<string, RequestSample[]>();
  for (const sample of recentRequests) {
    const key = `${sample.method} ${sample.route}`;
    const group = apiGroups.get(key) ?? [];
    group.push(sample);
    apiGroups.set(key, group);
  }

  const buckets = Array.from({ length: 12 }, (_, index) => {
    const start = now - (11 - index) * 5 * 60 * 1000;
    const end = start + 5 * 60 * 1000;
    const api = recentRequests.filter((sample) => sample.at >= start && sample.at < end);
    const pages = recentPages.filter((sample) => sample.at >= start && sample.at < end);
    return {
      time: new Date(start).toISOString(),
      requests: api.length,
      errors: api.filter((sample) => sample.status >= 500).length,
      avgLatencyMs: api.length ? Math.round(api.reduce((sum, sample) => sum + sample.durationMs, 0) / api.length) : 0,
      pageLoads: pages.length,
    };
  });

  return {
    generatedAt: new Date(now).toISOString(),
    processStartedAt: new Date(startedAt).toISOString(),
    uptimeSeconds: Math.floor((now - startedAt) / 1000),
    windowMinutes: 60,
    totals: {
      requests: recentRequests.length,
      errors: recentRequests.filter((sample) => sample.status >= 500).length,
      clientErrors: clientSamples.filter((sample) => sample.at >= windowStart && sample.kind === "client_error").length,
      pageLoads: recentPages.length,
      averageLatencyMs: recentRequests.length ? Math.round(recentRequests.reduce((sum, sample) => sum + sample.durationMs, 0) / recentRequests.length) : 0,
      p95LatencyMs: percentile(recentRequests.map((sample) => sample.durationMs), 0.95),
      averagePageLoadMs: recentPages.length ? Math.round(recentPages.reduce((sum, sample) => sum + (sample.durationMs ?? 0), 0) / recentPages.length) : 0,
    },
    traffic: buckets,
    endpoints: Array.from(apiGroups.entries()).map(([endpoint, samples]) => ({
      endpoint,
      requests: samples.length,
      errors: samples.filter((sample) => sample.status >= 500).length,
      averageLatencyMs: Math.round(samples.reduce((sum, sample) => sum + sample.durationMs, 0) / samples.length),
      p95LatencyMs: percentile(samples.map((sample) => sample.durationMs), 0.95),
    })).sort((a, b) => b.requests - a.requests).slice(0, 20),
    pages: Array.from(new Set(recentPages.map((sample) => sample.page))).map((page) => {
      const samples = recentPages.filter((sample) => sample.page === page).map((sample) => sample.durationMs ?? 0);
      return { page, loads: samples.length, averageLoadMs: Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length), p95LoadMs: percentile(samples, 0.95) };
    }).sort((a, b) => b.loads - a.loads),
    incidents: incidents.slice(-50).reverse(),
  };
}
