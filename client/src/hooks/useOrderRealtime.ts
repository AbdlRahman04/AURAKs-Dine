import { useEffect, useRef, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { ORDERS_QUERY_KEY } from "@/hooks/useOrders";

const MAX_RECONNECT_DELAY = 30_000;

export function useOrderRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelay = useRef(1_000);

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;

    const connect = () => {
      if (disposed) return;

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

      socket.onopen = () => {
        reconnectDelay.current = 1_000;
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { type?: string };
          if (
            data.type === "ORDER_STATUS_UPDATE" ||
            data.type === "ORDER_PAYMENT_UPDATE" ||
            data.type === "NEW_ORDER"
          ) {
            queryClient.invalidateQueries({ queryKey: [ORDERS_QUERY_KEY] });
          }
        } catch {
          // Ignore malformed realtime messages and keep the connection alive.
        }
      };

      socket.onerror = () => socket?.close();
      socket.onclose = () => {
        setIsConnected(false);
        if (disposed) return;
        const delay = reconnectDelay.current;
        reconnectDelay.current = Math.min(delay * 2, MAX_RECONNECT_DELAY);
        reconnectTimer.current = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      disposed = true;
      setIsConnected(false);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socket?.close();
    };
  }, []);

  return { isConnected };
}
