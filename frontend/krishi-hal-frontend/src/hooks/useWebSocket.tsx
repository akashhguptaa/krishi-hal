import { useEffect, useCallback, useRef } from "react";

export const useWebSocket = (url: string) => {
  const ws = useRef<WebSocket | null>(null);

  const send = useCallback((data: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(data);
    }
  }, []);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => console.log("WebSocket Connected");
    ws.current.onerror = (error) => console.error("WebSocket Error:", error);
    ws.current.onclose = () => console.log("WebSocket Disconnected");

    return () => {
      ws.current?.close();
    };
  }, [url]);

  return { send };
};
