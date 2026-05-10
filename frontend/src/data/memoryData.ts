import type { Edge, Node } from "@xyflow/react";

export type MemoryKind =
  | "memory"
  | "project"
  | "relationship"
  | "location"
  | "idea"
  | "dream"
  | "music"
  | "media";

export type MemoryRecord = {
  id: string;
  title: string;
  kind: MemoryKind;
  date: string;
  sector: string;
  emotion: string;
  intensity: number;
  tags: string[];
  summary: string;
  location?: string;
  weather?: string;
  audio?: string;
  spotifyUrl?: string;
  spotifyEmbedUrl?: string;
  generatedAudioName?: string;
};

export const memories: MemoryRecord[] = [
  {
    id: "m-01",
    title: "First Signal",
    kind: "memory",
    date: "2021-04-18",
    sector: "Origin",
    emotion: "awe",
    intensity: 82,
    tags: ["home", "identity", "turning-point"],
    location: "Brooklyn",
    weather: "rain at midnight",
    summary: "A late-night realization that became the seed for a creative operating system."
  },
  {
    id: "p-01",
    title: "MemoryOS Build",
    kind: "project",
    date: "2026-05-09",
    sector: "Active Projects",
    emotion: "focus",
    intensity: 96,
    tags: ["typescript", "spatial-ui", "graph"],
    summary: "The current living project world with backend, realtime sync, and graph intelligence."
  },
  {
    id: "d-01",
    title: "Blue Station Dream",
    kind: "dream",
    date: "2025-11-02",
    sector: "Dreamspace",
    emotion: "mystery",
    intensity: 74,
    tags: ["train", "water", "recurring"],
    summary: "A station under an ocean ceiling, repeating as a navigation symbol."
  },
  {
    id: "r-01",
    title: "Maya",
    kind: "relationship",
    date: "2024-06-16",
    sector: "People",
    emotion: "warmth",
    intensity: 88,
    tags: ["friend", "shared-memories", "music"],
    summary: "A high-trust connection with dense shared references and creative history."
  },
  {
    id: "l-01",
    title: "Lake Overlook",
    kind: "location",
    date: "2023-08-22",
    sector: "Places",
    emotion: "calm",
    intensity: 67,
    tags: ["travel", "quiet", "golden-hour"],
    location: "Finger Lakes",
    weather: "clear sunset",
    summary: "A meaningful place tied to decompression, voice notes, and long walks."
  },
  {
    id: "mu-01",
    title: "Night Drive Loop",
    kind: "music",
    date: "2022-12-09",
    sector: "Soundtrack",
    emotion: "nostalgia",
    intensity: 78,
    tags: ["playlist", "drive", "winter"],
    audio: "synthwave",
    summary: "A cluster of songs that reactivates a winter route and a particular blue light."
  },
  {
    id: "i-01",
    title: "Portable Constellations",
    kind: "idea",
    date: "2026-01-14",
    sector: "Ideas",
    emotion: "curiosity",
    intensity: 71,
    tags: ["interface", "navigation", "memory"],
    summary: "A model for storing thoughts as spatial constellations instead of documents."
  },
  {
    id: "md-01",
    title: "Screenshot Stack",
    kind: "media",
    date: "2025-03-05",
    sector: "Media",
    emotion: "urgency",
    intensity: 59,
    tags: ["screenshots", "reference", "archive"],
    summary: "A recovered set of interface references linked to projects and ideas."
  }
];

const positions = [
  { x: -420, y: -120 },
  { x: 20, y: -220 },
  { x: 420, y: -20 },
  { x: -180, y: 180 },
  { x: 240, y: 230 },
  { x: -520, y: 260 },
  { x: 560, y: -260 },
  { x: 20, y: 90 }
];

export const graphNodes: Node[] = memories.map((memory, index) => ({
  id: memory.id,
  type: "memory",
  position: positions[index],
  data: memory
}));

export const graphEdges: Edge[] = [
  ["m-01", "p-01"],
  ["p-01", "i-01"],
  ["d-01", "i-01"],
  ["r-01", "mu-01"],
  ["l-01", "m-01"],
  ["md-01", "p-01"],
  ["mu-01", "m-01"],
  ["r-01", "l-01"]
].map(([source, target], index) => ({
  id: `e-${index}`,
  source,
  target,
  animated: true,
  style: { stroke: "rgba(98, 240, 255, .55)", strokeWidth: 1.5 }
}));

export const routeInsights = {
  dashboard: ["8 active memory clusters", "3 realtime events", "91% graph health"],
  timeline: ["6 year sectors", "42 dense periods", "Playback ready"],
  projects: ["4 dependency maps", "12 dev log entries", "GitHub sync armed"],
  archive: ["218 indexed records", "7 duplicate candidates", "12 hidden memories"],
  dreamspace: ["16 recurring symbols", "5 linked dream paths", "Fog map stable"],
  relationships: ["24 connection nodes", "8 shared timelines", "3 strong clusters"],
  locations: ["39 visited places", "11 meaningful pins", "Weather replay active"],
  music: ["18 emotional playlists", "62 song links", "Waveform memory mode"],
  ideas: ["31 floating concepts", "9 collisions", "4 ready to promote"],
  media: ["74 assets", "28 thumbnails", "5 PDFs indexed"],
  settings: ["Privacy locked", "Backups scheduled", "Ambient engine tuned"],
  profile: ["Personal graph online", "Export available", "Session secured"]
};

export const timelineEvents = memories
  .slice()
  .sort((a, b) => a.date.localeCompare(b.date));
