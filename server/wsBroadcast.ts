import { WebSocket } from "ws";

/** Shared WebSocket client set for kitchen / order real-time updates */
export const wsClients = new Set<WebSocket>();

export function broadcastWs(payload: object) {
  const message = JSON.stringify(payload);
  wsClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
