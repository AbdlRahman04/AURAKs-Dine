import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./localAuth";
import { registerFeatures } from "./registerFeatures";
import { wsClients } from "./wsBroadcast";
import { isAdmin, isAuthenticated } from "./localAuth";
import { getObservabilitySnapshot, limitTelemetry, recordClientTelemetry } from "./observability";

/**
 * Thin HTTP/WebSocket bootstrap. Feature routes live under features/*.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  registerFeatures(app);

  app.get("/api/observability", isAuthenticated, isAdmin, (_req, res) => {
    res.set("Cache-Control", "no-store").json(getObservabilitySnapshot());
  });
  app.post("/api/observability/events", limitTelemetry, recordClientTelemetry);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "quickdineflow" });
  });

  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    wsClients.add(ws);

    ws.on("close", () => {
      wsClients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(ws);
    });
  });

  return httpServer;
}
