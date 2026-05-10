import { useEffect, useState } from "react";
import { useMemoryStore } from "../store/useMemoryStore";

export function useRealtime() {
  const [status, setStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const notify = useMemoryStore((state) => state.notify);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/realtime`);
    socket.addEventListener("open", () => setStatus("online"));
    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as { type: string; message?: string };
        if (payload.type === "memory:pulse" && payload.message) notify(payload.message);
      } catch {
        notify("Realtime signal received.");
      }
    });
    socket.addEventListener("close", () => setStatus("offline"));
    socket.addEventListener("error", () => setStatus("offline"));
    return () => socket.close();
  }, [notify]);

  return status;
}
