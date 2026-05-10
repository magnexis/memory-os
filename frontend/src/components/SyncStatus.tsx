import { Cloud, CloudOff, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { useMemoryStore } from "../store/useMemoryStore";

export function SyncStatus() {
  const online = useMemoryStore((state) => state.online);
  const queue = useMemoryStore((state) => state.offlineQueue);
  const setOnline = useMemoryStore((state) => state.setOnline);
  const syncOfflineQueue = useMemoryStore((state) => state.syncOfflineQueue);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, [setOnline]);

  return (
    <button
      onClick={() => queue.length ? syncOfflineQueue() : undefined}
      className="hidden h-10 shrink-0 items-center gap-2 rounded-md border border-cyan/15 bg-ink px-2.5 text-xs text-slate-400 hover:border-cyan/35 lg:flex"
    >
      {online ? <Cloud className="size-4 text-cyan" /> : <CloudOff className="size-4 text-rose" />}
      {online ? "online" : "offline"}
      {queue.length > 0 && (
        <span className="flex items-center gap-1 text-cyan">
          <RefreshCw className="size-3" /> {queue.length} queued
        </span>
      )}
    </button>
  );
}
