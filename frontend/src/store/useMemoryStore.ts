import { create } from "zustand";
import type { MemoryRecord } from "../data/memoryData";
import { memories } from "../data/memoryData";
import type { MemoryLink } from "../lib/memoryAnalysis";
import { createMemoryLink } from "../lib/memoryAnalysis";

type Toast = { id: number; message: string };

type MemoryState = {
  records: MemoryRecord[];
  links: MemoryLink[];
  offlineQueue: MemoryRecord[];
  online: boolean;
  selectedId: string;
  query: string;
  ambient: number;
  animation: number;
  glow: number;
  toastDuration: number;
  densityMode: "compact" | "balanced" | "cinematic";
  density: "year" | "month" | "week" | "day";
  toasts: Toast[];
  setOnline: (online: boolean) => void;
  setSelected: (id: string) => void;
  setQuery: (query: string) => void;
  setAmbient: (value: number) => void;
  setAnimation: (value: number) => void;
  setGlow: (value: number) => void;
  setToastDuration: (value: number) => void;
  setDensityMode: (value: MemoryState["densityMode"]) => void;
  setDensity: (density: MemoryState["density"]) => void;
  addRecord: (record: MemoryRecord) => void;
  queueOfflineRecord: (record: MemoryRecord) => void;
  syncOfflineQueue: () => void;
  acceptLink: (sourceId: string, targetId: string, label: string, strength: number) => void;
  notify: (message: string) => void;
  dismiss: (id: number) => void;
};

const storedRecords = typeof window !== "undefined" ? window.localStorage.getItem("memoryos.records") : null;
const storedLinks = typeof window !== "undefined" ? window.localStorage.getItem("memoryos.links") : null;
const storedQueue = typeof window !== "undefined" ? window.localStorage.getItem("memoryos.offlineQueue") : null;
const storedPrefs = typeof window !== "undefined" ? window.localStorage.getItem("memoryos.preferences") : null;
const prefs = storedPrefs ? JSON.parse(storedPrefs) as Partial<Pick<MemoryState, "ambient" | "animation" | "glow" | "toastDuration" | "densityMode">> : {};

function nextPrefs(state: MemoryState, overrides: Partial<Pick<MemoryState, "ambient" | "animation" | "glow" | "toastDuration" | "densityMode">>) {
  return {
    ambient: state.ambient,
    animation: state.animation,
    glow: state.glow,
    toastDuration: state.toastDuration,
    densityMode: state.densityMode,
    ...overrides
  };
}

function persist(key: string, value: unknown) {
  if (typeof window !== "undefined") window.localStorage.setItem(key, JSON.stringify(value));
}

export const useMemoryStore = create<MemoryState>((set) => ({
  records: storedRecords ? JSON.parse(storedRecords) as MemoryRecord[] : memories,
  links: storedLinks ? JSON.parse(storedLinks) as MemoryLink[] : [
    createMemoryLink("m-01", "p-01", "inspired project", 86),
    createMemoryLink("r-01", "mu-01", "shared soundtrack", 74),
    createMemoryLink("l-01", "m-01", "place anchor", 68)
  ],
  offlineQueue: storedQueue ? JSON.parse(storedQueue) as MemoryRecord[] : [],
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  selectedId: memories[0].id,
  query: "",
  ambient: prefs.ambient ?? 70,
  animation: prefs.animation ?? 74,
  glow: prefs.glow ?? 58,
  toastDuration: prefs.toastDuration ?? 3000,
  densityMode: prefs.densityMode ?? "cinematic",
  density: "month",
  toasts: [],
  setOnline: (online) => set({ online }),
  setSelected: (id) => set({ selectedId: id }),
  setQuery: (query) => set({ query }),
  setAmbient: (ambient) => set((state) => {
    persist("memoryos.preferences", nextPrefs(state, { ambient }));
    return { ambient };
  }),
  setAnimation: (animation) => set((state) => {
    persist("memoryos.preferences", nextPrefs(state, { animation }));
    return { animation };
  }),
  setGlow: (glow) => set((state) => {
    persist("memoryos.preferences", nextPrefs(state, { glow }));
    return { glow };
  }),
  setToastDuration: (toastDuration) => set((state) => {
    persist("memoryos.preferences", nextPrefs(state, { toastDuration }));
    return { toastDuration };
  }),
  setDensityMode: (densityMode) => set((state) => {
    persist("memoryos.preferences", nextPrefs(state, { densityMode }));
    return { densityMode };
  }),
  setDensity: (density) => set({ density }),
  addRecord: (record) => set((state) => {
    const records = [record, ...state.records];
    persist("memoryos.records", records);
    return { records };
  }),
  queueOfflineRecord: (record) => set((state) => {
    const offlineQueue = [record, ...state.offlineQueue];
    const records = [record, ...state.records];
    persist("memoryos.offlineQueue", offlineQueue);
    persist("memoryos.records", records);
    return { offlineQueue, records };
  }),
  syncOfflineQueue: () => set((state) => {
    persist("memoryos.offlineQueue", []);
    return { offlineQueue: [], toasts: [...state.toasts.slice(-3), { id: Date.now(), message: "Offline capture queue synchronized." }] };
  }),
  acceptLink: (sourceId, targetId, label, strength) => set((state) => {
    const links = [createMemoryLink(sourceId, targetId, label, strength), ...state.links];
    persist("memoryos.links", links);
    return { links };
  }),
  notify: (message) =>
    set((state) => ({
      toasts: [...state.toasts.slice(-3), { id: Date.now(), message }]
    })),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }))
}));
