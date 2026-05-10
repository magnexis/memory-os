import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import * as Switch from "@radix-ui/react-switch";
import { motion } from "framer-motion";
import {
  Archive,
  AudioLines,
  CalendarClock,
  CloudUpload,
  Download,
  EyeOff,
  FileText,
  Filter,
  GitBranch,
  Image,
  Link2,
  Lock,
  MapPin,
  Music,
  Network,
  Plus,
  Save,
  Search,
  Settings,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { Panel } from "../components/Panel";
import { SmartLinkPanel } from "../components/SmartLinkPanel";
import { memories, routeInsights, type MemoryKind } from "../data/memoryData";
import { buildHeatmap } from "../lib/memoryAnalysis";
import { parseSpotifyUrl } from "../lib/spotify";
import { useMemoryStore } from "../store/useMemoryStore";

type RouteConfig = {
  title: string;
  eyebrow: string;
  kind: MemoryKind;
  tone: string;
  actions: Array<[LucideIcon, string, string]>;
};

const configs: Record<string, RouteConfig> = {
  projects: {
    title: "Project worlds with living dependency maps.",
    eyebrow: "Projects",
    kind: "project",
    tone: "development logs, task paths, markdown notes, GitHub sync",
    actions: [[GitBranch, "GitHub", "GitHub integration panel opened."], [Plus, "Task", "New project task added."], [FileText, "Markdown", "Markdown field expanded."]]
  },
  archive: {
    title: "Searchable deep storage for everything nearly forgotten.",
    eyebrow: "Archive",
    kind: "media",
    tone: "fuzzy search, duplicate detection, hidden memory recovery",
    actions: [[Search, "Search", "Advanced archive filters opened."], [EyeOff, "Hidden", "Hidden memories surfaced."], [Trash2, "Duplicates", "Duplicate detector queued a scan."]]
  },
  dreamspace: {
    title: "Surreal maps for symbols that keep returning.",
    eyebrow: "Dreamspace",
    kind: "dream",
    tone: "floating symbols, fog overlays, constellation pathways",
    actions: [[Sparkles, "Symbol", "Recurring symbol tagged."], [Upload, "Sketch", "Dream sketch upload accepted."], [Network, "Theme", "Recurring theme connected."]]
  },
  relationships: {
    title: "A neural social map of shared memory clusters.",
    eyebrow: "Relationships",
    kind: "relationship",
    tone: "interaction timelines, shared moments, connection strength",
    actions: [[Users, "Person", "Relationship node opened."], [Link2, "Shared", "Shared memory timeline filtered."], [Network, "Strength", "Connection strength recalculated."]]
  },
  locations: {
    title: "Dark tactical map of places that changed shape inside you.",
    eyebrow: "Locations",
    kind: "location",
    tone: "memory pins, movement trails, weather replay, meaningful places",
    actions: [[MapPin, "Pin", "Memory pin dropped."], [AudioLines, "Weather", "Weather replay started."], [Network, "Trail", "Movement trail animated."]]
  },
  music: {
    title: "Soundtracks bound to moments, routes, and emotions.",
    eyebrow: "Music",
    kind: "music",
    tone: "waveforms, emotional playlists, playback history",
    actions: [[Music, "Playlist", "Emotional playlist generated."], [AudioLines, "Waveform", "Reactive waveform mode enabled."], [Link2, "Link", "Song linked to selected memory."]]
  },
  ideas: {
    title: "Floating concepts looking for gravity.",
    eyebrow: "Ideas",
    kind: "idea",
    tone: "concept collisions, promotion paths, spatial notes",
    actions: [[Sparkles, "Promote", "Idea promoted into active project."], [Network, "Connect", "Concept connection created."], [Tag, "Tag", "Idea tag added."]]
  },
  media: {
    title: "Photos, videos, audio, screenshots, PDFs, all indexed.",
    eyebrow: "Media",
    kind: "media",
    tone: "metadata extraction, previews, lazy loading, optimized storage",
    actions: [[CloudUpload, "Upload", "Media ingest dialog opened."], [Image, "Preview", "Preview generation queued."], [Archive, "Index", "Metadata extraction completed."]]
  }
};

export function CollectionPage({ route }: { route: keyof typeof configs }) {
  const config = configs[route];
  const notify = useMemoryStore((state) => state.notify);
  const addRecord = useMemoryStore((state) => state.addRecord);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [activeAction, setActiveAction] = useState(config.actions[0][1]);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const localRecords = useMemoryStore((state) => state.records);
  const records = useMemo(
    () => localRecords.filter((item) => item.kind === config.kind || item.tags.join(" ").includes(route)).filter((item) => item.title.toLowerCase().includes(filter.toLowerCase()) || item.summary.toLowerCase().includes(filter.toLowerCase())),
    [config.kind, filter, localRecords, route]
  );
  const selectedRecord = records.find((record) => record.id === selectedRecordId) ?? records[0];
  const heatmap = useMemo(() => buildHeatmap(localRecords), [localRecords]);

  const createRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    addRecord({
      id: `${route}-${Date.now()}`,
      title: String(form.get("title")),
      kind: config.kind,
      date: new Date().toISOString().slice(0, 10),
      sector: config.eyebrow,
      emotion: String(form.get("emotion")),
      intensity: 64,
      tags: String(form.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean),
      summary: String(form.get("summary"))
    });
    setOpen(false);
    notify(`${config.eyebrow} record created.`);
  };

  return (
    <div className="mx-auto min-h-full max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">{config.eyebrow}</div>
          <h1 className="mt-2 max-w-4xl text-3xl font-light md:text-4xl">{config.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">{config.tone}</p>
        </div>
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="inline-flex h-11 items-center gap-2 border border-cyan/30 bg-cyan/10 px-4 text-cyan shadow-signal">
              <Plus className="size-4" /> New record
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 border border-cyan/20 bg-ink p-6 shadow-signal">
              <Dialog.Title className="mb-5 text-xl">Create {config.eyebrow} Record</Dialog.Title>
              <form onSubmit={createRecord} className="space-y-3">
                {["title", "emotion", "tags"].map((field) => (
                  <input key={field} required name={field} placeholder={field} className="h-11 w-full border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
                ))}
                <textarea required name="summary" placeholder="summary" className="h-28 w-full resize-none border border-cyan/15 bg-void p-3 outline-none focus:border-cyan" />
                <button className="h-11 w-full border border-cyan/35 bg-cyan/10 text-cyan">Save record</button>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {config.actions.map(([Icon, label]) => (
          <ActionButton key={label} icon={Icon} label={label} onClick={() => setActiveAction(label)} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <Panel title={`${config.eyebrow} Matrix`} meta={routeInsights[route as keyof typeof routeInsights]?.join(" / ")}>
          <div className="mb-4 flex items-center gap-2 border border-cyan/15 bg-void px-3">
            <Filter className="size-4 text-cyan" />
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter this space..." className="h-11 flex-1 bg-transparent outline-none" />
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {records.length === 0 && (
              <button onClick={() => setOpen(true)} className="min-h-40 border border-dashed border-cyan/20 bg-void/70 p-4 text-left text-slate-400 hover:border-cyan/40">
                <span className="block text-lg text-slate-100">Create the first {config.eyebrow.toLowerCase()} record</span>
                <span className="mt-2 block text-sm">This route is fully wired. Add a record to unlock filters, workbench actions, spatial panels, and link suggestions.</span>
              </button>
            )}
            {records.map((record, index) => (
              <motion.button
                key={record.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedRecordId(record.id)}
                className={`min-h-40 border bg-void/70 p-4 text-left hover:border-cyan/40 ${selectedRecord?.id === record.id ? "border-cyan/60" : "border-cyan/12"}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-[.2em] text-cyan">{record.kind}</span>
                  <span className="text-xs text-slate-500">{record.date}</span>
                </div>
                <div className="text-lg text-slate-100">{record.title}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{record.summary}</p>
              </motion.button>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <ActionWorkbench route={route} activeAction={activeAction} selectedRecord={selectedRecord} />
          <RouteFeaturePanel route={route} records={records} heatmap={heatmap} onSelectRecord={setSelectedRecordId} />
        </div>
      </div>
    </div>
  );
}

function ActionWorkbench({
  route,
  activeAction,
  selectedRecord
}: {
  route: keyof typeof configs;
  activeAction: string;
  selectedRecord: typeof memories[number] | undefined;
}) {
  const notify = useMemoryStore((state) => state.notify);
  const records = useMemoryStore((state) => state.records);
  const addRecord = useMemoryStore((state) => state.addRecord);
  const derivedSequence = useRef(0);

  if (!selectedRecord) {
    return (
      <Panel title={`${activeAction} Console`} meta={route}>
        <p className="text-sm text-slate-500">This section is ready. Create a record to unlock the {activeAction.toLowerCase()} tools.</p>
      </Panel>
    );
  }

  const addDerivedRecord = (kind: MemoryKind, title: string, summary: string, tags: string[]) => {
    derivedSequence.current += 1;
    addRecord({
      id: `${route}-${activeAction}-${selectedRecord.id}-${derivedSequence.current}`,
      title,
      kind,
      date: new Date().toISOString().slice(0, 10),
      sector: configs[route].eyebrow,
      emotion: selectedRecord.emotion,
      intensity: Math.min(100, selectedRecord.intensity + 6),
      tags,
      location: selectedRecord.location,
      summary
    });
  };

  if (route === "music" && (activeAction === "Playlist" || activeAction === "Waveform" || activeAction === "Link")) {
    return <MusicWorkbench selectedRecord={selectedRecord} route={route} activeAction={activeAction} />;
  }

  if (activeAction === "GitHub") {
    return (
      <Panel title="GitHub Linker" meta="project integration">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            const url = String(new FormData(event.currentTarget).get("repo"));
            addDerivedRecord("project", `${selectedRecord.title} Repo`, `Linked repository ${url} to ${selectedRecord.title}.`, ["github", "repo", selectedRecord.title.toLowerCase()]);
          }}
        >
          <input name="repo" required placeholder="https://github.com/user/repo" className="h-10 w-full border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
          <button className="h-10 w-full border border-cyan/35 bg-cyan/10 text-cyan">Link repository</button>
        </form>
      </Panel>
    );
  }

  if (activeAction === "Task") {
    return (
      <Panel title="Task Board" meta="project progress">
        {["Capture requirements", "Map dependencies", "Review media", "Ship checkpoint"].map((task, index) => (
          <button key={task} onClick={() => notify(`${task} marked ${index % 2 ? "blocked" : "complete"}.`)} className="mb-2 flex w-full items-center justify-between border border-cyan/10 p-3 text-left hover:border-cyan/40">
            <span>{task}</span>
            <span className="font-mono text-xs text-cyan">{index % 2 ? "blocked" : "done"}</span>
          </button>
        ))}
      </Panel>
    );
  }

  if (activeAction === "Markdown") {
    return (
      <Panel title="Markdown Notes" meta="editable project log">
        <textarea defaultValue={`# ${selectedRecord.title}\n\n${selectedRecord.summary}\n\n- Linked memory: ${selectedRecord.date}`} className="h-48 w-full resize-none border border-cyan/15 bg-void p-3 font-mono text-sm outline-none focus:border-cyan" />
      </Panel>
    );
  }

  if (activeAction === "Search") {
    return (
      <Panel title="Advanced Search" meta="live local filtering">
        <div className="space-y-2">
          {records.filter((record) => record.tags.some((tag) => selectedRecord.tags.includes(tag)) || record.emotion === selectedRecord.emotion).slice(0, 5).map((record) => (
            <button key={record.id} className="w-full border border-cyan/10 p-3 text-left hover:border-cyan/40">
              <div className="text-sm">{record.title}</div>
              <div className="text-xs text-slate-500">{record.tags.join(", ")}</div>
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (activeAction === "Hidden") {
    return (
      <Panel title="Hidden Recovery" meta="soft-hidden candidates">
        <button onClick={() => addDerivedRecord(selectedRecord.kind, `Recovered: ${selectedRecord.title}`, `Recovered forgotten notes around ${selectedRecord.title}.`, ["recovered", ...selectedRecord.tags])} className="h-11 w-full border border-cyan/30 bg-cyan/10 text-cyan">
          Recover related memory
        </button>
      </Panel>
    );
  }

  if (activeAction === "Duplicates") {
    return (
      <Panel title="Duplicate Detector" meta="similarity scan">
        <div className="space-y-2">
          {records.filter((record) => record.id !== selectedRecord.id && record.kind === selectedRecord.kind).slice(0, 3).map((record) => (
            <button key={record.id} onClick={() => notify(`${record.title} compared against ${selectedRecord.title}.`)} className="w-full border border-cyan/10 p-3 text-left hover:border-cyan/40">
              {record.title}
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (activeAction === "Symbol" || activeAction === "Theme") {
    return (
      <Panel title={`${activeAction} Mapper`} meta="dream analysis">
        <div className="grid grid-cols-3 gap-2">
          {["water", "station", "light", "door", "voice", "sky"].map((symbol) => (
            <button key={symbol} onClick={() => addDerivedRecord("dream", `${symbol} symbol`, `${symbol} recurring symbol linked to ${selectedRecord.title}.`, ["symbol", symbol])} className="border border-cyan/10 p-3 text-sm hover:border-cyan/40">
              {symbol}
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (activeAction === "Sketch" || activeAction === "Upload") {
    return (
      <Panel title="Upload Staging" meta="local attachment references">
        <label className="grid min-h-28 cursor-pointer place-items-center border border-dashed border-cyan/20 bg-void p-4 text-center text-sm text-slate-400 hover:border-cyan/40">
          Drop or select files for {selectedRecord.title}
          <input type="file" multiple className="hidden" onChange={(event) => notify(`${event.target.files?.length ?? 0} file reference(s) staged.`)} />
        </label>
      </Panel>
    );
  }

  if (activeAction === "Person" || activeAction === "Shared" || activeAction === "Strength") {
    return (
      <Panel title="Relationship Console" meta="shared memory graph">
        <div className="space-y-3">
          <div className="h-2 bg-slate-800"><div className="h-full bg-cyan" style={{ width: `${selectedRecord.intensity}%` }} /></div>
          <button onClick={() => addDerivedRecord("relationship", `Shared with ${selectedRecord.title}`, `A shared memory cluster connected to ${selectedRecord.title}.`, ["shared", "relationship"])} className="h-10 w-full border border-cyan/30 bg-cyan/10 text-cyan">
            Add shared memory
          </button>
        </div>
      </Panel>
    );
  }

  if (activeAction === "Pin" || activeAction === "Weather" || activeAction === "Trail") {
    return (
      <Panel title="Location Console" meta="map operation">
        <div className="relative h-36 border border-cyan/10 bg-void">
          <div className="tactical-grid absolute inset-0 opacity-60" />
          <MapPin className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-cyan" />
        </div>
        <button onClick={() => addDerivedRecord("location", `${selectedRecord.title} Map Pin`, `Pinned ${selectedRecord.location ?? selectedRecord.title} with weather replay metadata.`, ["map", "pin"])} className="mt-3 h-10 w-full border border-cyan/30 bg-cyan/10 text-cyan">
          Save map state
        </button>
      </Panel>
    );
  }

  if (activeAction === "Promote" || activeAction === "Connect" || activeAction === "Tag") {
    return (
      <Panel title="Idea Console" meta="concept operations">
        <button onClick={() => addDerivedRecord("project", `Project: ${selectedRecord.title}`, `Promoted idea into an active project world.`, ["promoted", ...selectedRecord.tags])} className="mb-2 h-10 w-full border border-cyan/30 bg-cyan/10 text-cyan">
          Promote to project
        </button>
        <button onClick={() => addDerivedRecord("idea", `${selectedRecord.title} Branch`, `A new connected idea branch.`, ["branch", ...selectedRecord.tags])} className="h-10 w-full border border-cyan/15 text-slate-300 hover:border-cyan/40">
          Create idea branch
        </button>
      </Panel>
    );
  }

  return (
    <Panel title={`${activeAction} Console`} meta={route}>
      <button onClick={() => addDerivedRecord(selectedRecord.kind, `${selectedRecord.title} Copy`, `Generated from ${activeAction.toLowerCase()} operation.`, [activeAction.toLowerCase(), ...selectedRecord.tags])} className="h-10 w-full border border-cyan/30 bg-cyan/10 text-cyan">
        Run operation
      </button>
    </Panel>
  );
}

function MusicWorkbench({
  selectedRecord,
  route,
  activeAction
}: {
  selectedRecord: typeof memories[number];
  route: keyof typeof configs;
  activeAction: string;
}) {
  const addRecord = useMemoryStore((state) => state.addRecord);
  const acceptLink = useMemoryStore((state) => state.acceptLink);
  const notify = useMemoryStore((state) => state.notify);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Array<AudioNode & { stop?: (when?: number) => void }>>([]);
  const sequence = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [generatedName, setGeneratedName] = useState("No generated loop yet");
  const [spotifyLink, setSpotifyLink] = useState(selectedRecord.spotifyEmbedUrl ?? "");
  const [spotifyError, setSpotifyError] = useState("");

  const stopGeneratedAudio = () => {
    nodesRef.current.forEach((node) => {
      try {
        node.stop?.();
        node.disconnect();
      } catch {
        // Already disconnected.
      }
    });
    nodesRef.current = [];
    setPlaying(false);
  };

  const generateMemoryLoop = async () => {
    stopGeneratedAudio();
    const context = new AudioContext();
    audioContextRef.current = context;
    const master = context.createGain();
    const delay = context.createDelay();
    const feedback = context.createGain();
    const filter = context.createBiquadFilter();
    const now = context.currentTime;
    const base = 110 + selectedRecord.intensity * 2;
    const moodOffset = selectedRecord.emotion.length * 7;
    const frequencies = [base, base * 1.5 + moodOffset, base * 2 + moodOffset / 2];

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 1.4);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900 + selectedRecord.intensity * 18, now);
    delay.delayTime.setValueAtTime(0.32, now);
    feedback.gain.setValueAtTime(0.28, now);

    frequencies.forEach((frequency, index) => {
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.linearRampToValueAtTime(frequency + 12 + index * 9, now + 8);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.07 / (index + 1), now + 0.8 + index * 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 16);
      osc.connect(gain).connect(filter);
      osc.start(now + index * 0.18);
      osc.stop(now + 16.5);
      nodesRef.current.push(osc, gain);
    });

    filter.connect(delay).connect(feedback).connect(delay);
    filter.connect(master).connect(context.destination);
    delay.connect(master);
    nodesRef.current.push(master, delay, feedback, filter);
    setPlaying(true);
    const title = `${selectedRecord.emotion} memory loop ${sequence.current + 1}`;
    sequence.current += 1;
    setGeneratedName(title);
    addRecord({
      id: `${route}-generated-audio-${selectedRecord.id}-${sequence.current}`,
      title,
      kind: "music",
      date: new Date().toISOString().slice(0, 10),
      sector: "Generated Soundtrack",
      emotion: selectedRecord.emotion,
      intensity: selectedRecord.intensity,
      tags: ["generated-audio", "web-audio", ...selectedRecord.tags.slice(0, 3)],
      location: selectedRecord.location,
      audio: "browser-generated ambient loop",
      generatedAudioName: title,
      summary: `A browser-generated ambient loop derived from ${selectedRecord.title}, using intensity and emotion as synthesis parameters.`
    });
    notify("Generated a playable Web Audio memory loop.");
    window.setTimeout(() => setPlaying(false), 16500);
  };

  const linkSpotify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "Spotify memory link");
    const url = String(form.get("spotifyUrl"));
    const parsed = parseSpotifyUrl(url);
    if (!parsed) {
      setSpotifyError("Paste a valid open.spotify.com track, album, playlist, artist, show, or episode URL.");
      return;
    }
    setSpotifyError("");
    setSpotifyLink(parsed.embedUrl);
    const id = `${route}-spotify-${parsed.type}-${parsed.id}`;
    addRecord({
      id,
      title,
      kind: "music",
      date: new Date().toISOString().slice(0, 10),
      sector: "Spotify Links",
      emotion: selectedRecord.emotion,
      intensity: selectedRecord.intensity,
      tags: ["spotify", parsed.type, ...selectedRecord.tags.slice(0, 3)],
      location: selectedRecord.location,
      audio: "spotify",
      spotifyUrl: parsed.url,
      spotifyEmbedUrl: parsed.embedUrl,
      summary: `${title} linked from Spotify as soundtrack context for ${selectedRecord.title}.`
    });
    acceptLink(selectedRecord.id, id, "spotify soundtrack", 82);
    notify("Spotify item linked and embedded.");
  };

  return (
    <Panel title={activeAction === "Waveform" ? "Generated Audio Studio" : "Spotify + Soundtrack Linker"} meta="playable music tools">
      <div className="space-y-4">
        <div className="border border-cyan/10 bg-void p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-100">{generatedName}</div>
              <div className="text-xs text-slate-500">Generated from {selectedRecord.emotion}, intensity {selectedRecord.intensity}</div>
            </div>
            <span className={`size-3 ${playing ? "bg-gold shadow-signal" : "bg-slate-700"}`} />
          </div>
          <div className="mb-3 flex h-20 items-end gap-1">
            {Array.from({ length: 32 }).map((_, index) => (
              <span key={index} className={`flex-1 ${playing ? "bg-gold" : "bg-cyan/50"}`} style={{ height: `${18 + ((index * selectedRecord.intensity + 17) % 82)}%`, opacity: 0.28 + (index % 6) / 10 }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={generateMemoryLoop} className="h-10 border border-cyan/35 bg-cyan/10 text-cyan">
              Generate + play loop
            </button>
            <button onClick={stopGeneratedAudio} className="h-10 border border-cyan/15 text-slate-300 hover:border-cyan/40">
              Stop audio
            </button>
          </div>
        </div>

        <form onSubmit={linkSpotify} className="space-y-3 border border-cyan/10 bg-void p-3">
          <input name="title" placeholder="Display title, e.g. Night Drive - Kavinsky" className="h-10 w-full border border-cyan/15 bg-ink px-3 outline-none focus:border-cyan" />
          <input name="spotifyUrl" required placeholder="https://open.spotify.com/track/..." className="h-10 w-full border border-cyan/15 bg-ink px-3 outline-none focus:border-cyan" />
          {spotifyError && <p className="text-xs text-rose">{spotifyError}</p>}
          <button className="h-10 w-full border border-cyan/35 bg-cyan/10 text-cyan">Link Spotify song, album, or playlist</button>
        </form>

        {spotifyLink && (
          <iframe
            title="Spotify embed"
            src={spotifyLink}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border border-cyan/10"
          />
        )}
      </div>
    </Panel>
  );
}

function RouteFeaturePanel({
  route,
  records,
  heatmap,
  onSelectRecord
}: {
  route: keyof typeof configs;
  records: typeof memories;
  heatmap: ReturnType<typeof buildHeatmap>;
  onSelectRecord: (id: string) => void;
}) {
  const notify = useMemoryStore((state) => state.notify);

  if (route === "locations") {
    return (
      <Panel title="Location Archive" meta="dark tactical map">
        <div className="relative h-80 overflow-hidden border border-cyan/10 bg-void">
          <div className="tactical-grid absolute inset-0 opacity-70" />
          {records.map((record, index) => (
            <button
              key={record.id}
              onClick={() => onSelectRecord(record.id)}
              className="absolute grid size-8 place-items-center border border-cyan/30 bg-ink text-cyan shadow-signal"
              style={{ left: `${14 + ((index * 29) % 70)}%`, top: `${16 + ((index * 37) % 64)}%` }}
            >
              <MapPin className="size-4" />
            </button>
          ))}
          <svg className="absolute inset-0 h-full w-full">
            <path d="M30 232 C 102 88, 190 260, 282 128 S 436 92, 330 42" fill="none" stroke="rgba(98,240,255,.5)" strokeDasharray="8 8" />
          </svg>
        </div>
      </Panel>
    );
  }

  if (route === "music") {
    return (
      <Panel title="Soundtrack Timeline" meta="music memory overlay">
        <div className="mb-5 flex h-32 items-end gap-1 border border-cyan/10 bg-void p-3">
          {Array.from({ length: 56 }).map((_, index) => (
            <button
              key={index}
              onClick={() => notify(`Waveform marker ${index + 1} selected and preview highlighted.`)}
              className="flex-1 bg-cyan/70 hover:bg-gold"
              style={{ height: `${18 + ((index * 23) % 82)}%`, opacity: 0.25 + ((index * 7) % 60) / 100 }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {records.map((record) => (
            <button key={record.id} onClick={() => onSelectRecord(record.id)} className="flex w-full items-center justify-between border border-cyan/10 p-3 text-left hover:border-cyan/40">
              <span>{record.title}</span>
              <Music className="size-4 text-cyan" />
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (route === "projects") {
    return (
      <Panel title="Project World" meta="dependencies and progress">
        <div className="space-y-3">
          {["Research", "Prototype", "Backend", "Polish", "Deploy"].map((phase, index) => (
            <button key={phase} onClick={() => notify(`${phase} phase selected in the project workbench.`)} className="w-full border border-cyan/10 bg-void p-3 text-left hover:border-cyan/40">
              <div className="mb-2 flex justify-between text-sm"><span>{phase}</span><span className="font-mono text-cyan">{20 + index * 16}%</span></div>
              <div className="h-1 bg-slate-800"><div className="h-full bg-cyan" style={{ width: `${20 + index * 16}%` }} /></div>
            </button>
          ))}
        </div>
      </Panel>
    );
  }

  if (route === "archive") {
    return (
      <Panel title="Archive Replay" meta="period recovery">
        <div className="mb-4 grid grid-cols-4 gap-2">
          {["Month", "Year", "Trip", "Project"].map((label) => (
            <button key={label} onClick={() => notify(`${label} replay mode selected. Use Smart Link Queue below to recover related records.`)} className="border border-cyan/15 p-3 text-xs text-slate-300 hover:border-cyan/45">
              <CalendarClock className="mx-auto mb-2 size-4 text-cyan" /> {label}
            </button>
          ))}
        </div>
        <SmartLinkPanel />
      </Panel>
    );
  }

  return (
    <Panel title="Memory Heatmap" meta="activity density">
      <div className="grid grid-cols-6 gap-2">
        {heatmap.map((month) => (
          <button key={month.label} onClick={() => notify(`${month.label}: ${Math.round(month.activity * 100)}% activity density.`)} className="border border-cyan/10 bg-void p-3 text-left hover:border-cyan/40">
            <div className="mb-2 font-mono text-xs text-cyan">{month.label}</div>
            <div className="h-16 bg-cyan/10" style={{ opacity: 0.2 + month.activity * 0.8 }} />
            <div className="mt-2 text-[11px] text-slate-500">{month.creative} creative / {month.places} places</div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

export function SettingsPage() {
  const records = useMemoryStore((state) => state.records);
  const links = useMemoryStore((state) => state.links);
  const offlineQueue = useMemoryStore((state) => state.offlineQueue);
  const ambient = useMemoryStore((state) => state.ambient);
  const animation = useMemoryStore((state) => state.animation);
  const glow = useMemoryStore((state) => state.glow);
  const toastDuration = useMemoryStore((state) => state.toastDuration);
  const densityMode = useMemoryStore((state) => state.densityMode);
  const setAmbient = useMemoryStore((state) => state.setAmbient);
  const setAnimation = useMemoryStore((state) => state.setAnimation);
  const setGlow = useMemoryStore((state) => state.setGlow);
  const setToastDuration = useMemoryStore((state) => state.setToastDuration);
  const setDensityMode = useMemoryStore((state) => state.setDensityMode);
  const syncOfflineQueue = useMemoryStore((state) => state.syncOfflineQueue);
  const notify = useMemoryStore((state) => state.notify);
  const storedSettings = typeof window !== "undefined" ? window.localStorage.getItem("memoryos.settings") : null;
  const initialSettings = storedSettings ? JSON.parse(storedSettings) as {
    name?: string;
    email?: string;
    privateMode?: boolean;
    locationHistory?: boolean;
    autoLinking?: boolean;
    encryptedBackups?: boolean;
    backupSchedule?: string;
  } : {};
  const [accountName, setAccountName] = useState(initialSettings.name ?? "Archive Operator");
  const [accountEmail, setAccountEmail] = useState(initialSettings.email ?? "demo@memoryos.local");
  const [privateMode, setPrivateMode] = useState(initialSettings.privateMode ?? true);
  const [locationHistory, setLocationHistory] = useState(initialSettings.locationHistory ?? true);
  const [autoLinking, setAutoLinking] = useState(initialSettings.autoLinking ?? true);
  const [encryptedBackups, setEncryptedBackups] = useState(initialSettings.encryptedBackups ?? true);
  const [backupSchedule, setBackupSchedule] = useState(initialSettings.backupSchedule ?? "weekly");
  const [settingsPanel, setSettingsPanel] = useState("Storage");

  useEffect(() => {
    localStorage.setItem("memoryos.settings", JSON.stringify({
      name: accountName,
      email: accountEmail,
      privateMode,
      locationHistory,
      autoLinking,
      encryptedBackups,
      backupSchedule
    }));
  }, [accountName, accountEmail, privateMode, locationHistory, autoLinking, encryptedBackups, backupSchedule]);

  const saveSettings = (panel = settingsPanel) => {
    setSettingsPanel(panel);
    notify("Settings saved.");
  };

  const exportData = () => {
    const payload = JSON.stringify({ records, links, exportedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `memoryos-export-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setSettingsPanel("Export");
  };

  return (
    <div className="mx-auto min-h-full max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">Settings</div>
        <h1 className="mt-2 text-3xl font-light md:text-4xl">Tune the operating system.</h1>
      </div>
      <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <Panel title="Interface Engine" meta="dark mode only">
          <div className="space-y-6">
            <label className="block">
              <span className="mb-3 block text-sm text-slate-400">Ambient effects intensity</span>
              <Slider.Root value={[ambient]} onValueChange={([value]) => setAmbient(value)} max={100} step={1} className="relative flex h-5 items-center">
                <Slider.Track className="relative h-1 flex-1 bg-slate-800"><Slider.Range className="absolute h-full bg-cyan" /></Slider.Track>
                <Slider.Thumb className="block size-5 border border-cyan bg-ink shadow-signal" />
              </Slider.Root>
            </label>
            <label className="block">
              <span className="mb-3 block text-sm text-slate-400">Node animation intensity</span>
              <Slider.Root value={[animation]} onValueChange={([value]) => setAnimation(value)} max={100} step={1} className="relative flex h-5 items-center">
                <Slider.Track className="relative h-1 flex-1 bg-slate-800"><Slider.Range className="absolute h-full bg-cyan" /></Slider.Track>
                <Slider.Thumb className="block size-5 border border-cyan bg-ink shadow-signal" />
              </Slider.Root>
            </label>
            <label className="block">
              <span className="mb-3 block text-sm text-slate-400">Glow strength</span>
              <Slider.Root value={[glow]} onValueChange={([value]) => setGlow(value)} max={100} step={1} className="relative flex h-5 items-center">
                <Slider.Track className="relative h-1 flex-1 bg-slate-800"><Slider.Range className="absolute h-full bg-cyan" /></Slider.Track>
                <Slider.Thumb className="block size-5 border border-cyan bg-ink shadow-signal" />
              </Slider.Root>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["compact", "balanced", "cinematic"] as const).map((mode) => (
                <button key={mode} onClick={() => setDensityMode(mode)} className={`border p-3 text-sm ${densityMode === mode ? "border-cyan bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-400"}`}>
                  {mode}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="mb-3 block text-sm text-slate-400">Notification timer: {toastDuration === 0 ? "manual" : `${toastDuration / 1000}s`}</span>
              <select value={toastDuration} onChange={(event) => { setToastDuration(Number(event.target.value)); setSettingsPanel("Interface"); }} className="h-10 w-full rounded-md border border-cyan/15 bg-void px-3 text-sm outline-none focus:border-cyan">
                <option value={2000}>2 seconds</option>
                <option value={3000}>3 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={8000}>8 seconds</option>
                <option value={0}>Manual dismissal</option>
              </select>
            </label>
            <button onClick={() => { setAmbient(70); setAnimation(74); setGlow(58); setToastDuration(3000); setDensityMode("cinematic"); setSettingsPanel("Interface"); }} className="h-10 w-full border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40">
              Reset interface defaults
            </button>
          </div>
        </Panel>
        <Panel title="Account, Privacy & Storage" meta="working controls">
          <div className="space-y-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                saveSettings("Account");
              }}
              className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <input value={accountName} onChange={(event) => setAccountName(event.target.value)} className="h-10 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <input value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} type="email" className="h-10 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <button className="h-10 border border-cyan/30 bg-cyan/10 px-4 text-cyan">Save</button>
            </form>
            {[
              ["Private memory mode", privateMode, setPrivateMode, Lock],
              ["Location history", locationHistory, setLocationHistory, MapPin],
              ["Automatic smart linking", autoLinking, setAutoLinking, Link2],
              ["Encrypted backup snapshots", encryptedBackups, setEncryptedBackups, Shield]
            ].map(([label, value, setter, Icon]) => {
              const ToggleIcon = Icon as LucideIcon;
              const setValue = setter as (value: boolean) => void;
              return (
                <button
                  key={String(label)}
                  onClick={() => {
                    setValue(!value);
                    setSettingsPanel("Privacy");
                  }}
                  className="flex w-full items-center justify-between border border-cyan/15 p-4"
                >
                  <span className="flex items-center gap-3"><ToggleIcon className="size-4 text-cyan" /> {String(label)}</span>
                  <Switch.Root checked={Boolean(value)} className="h-6 w-11 bg-slate-800 data-[state=checked]:bg-cyan/40"><Switch.Thumb className="block size-5 translate-x-0.5 bg-slate-100 transition data-[state=checked]:translate-x-5" /></Switch.Root>
                </button>
              );
            })}
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <select value={backupSchedule} onChange={(event) => setBackupSchedule(event.target.value)} className="h-10 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan">
                <option value="manual">Manual backups</option>
                <option value="daily">Daily backups</option>
                <option value="weekly">Weekly backups</option>
                <option value="monthly">Monthly backups</option>
              </select>
              <button onClick={() => saveSettings("Backup")} className="h-10 border border-cyan/30 bg-cyan/10 px-4 text-cyan">
                Save schedule
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton icon={Download} label="Export" onClick={exportData} />
              <ActionButton icon={Save} label="Backup" onClick={() => { localStorage.setItem("memoryos.manualBackup", JSON.stringify({ records, links, createdAt: new Date().toISOString() })); setSettingsPanel("Backup"); }} />
              <ActionButton icon={Shield} label="Audit" onClick={() => setSettingsPanel("Audit")} />
              <ActionButton icon={Settings} label="Storage" onClick={() => setSettingsPanel("Storage")} />
              <ActionButton icon={Trash2} label="Clear Queue" onClick={() => { syncOfflineQueue(); setSettingsPanel("Storage"); }} />
            </div>
            <div className="border border-cyan/10 bg-void p-4">
              <div className="mb-2 font-mono text-xs uppercase tracking-[.2em] text-cyan">{settingsPanel}</div>
              {settingsPanel === "Export" && <p className="text-sm text-slate-400">JSON export generated from {records.length} records and {links.length} links.</p>}
              {settingsPanel === "Backup" && <p className="text-sm text-slate-400">{backupSchedule} backup schedule saved. Manual snapshot stored locally with current graph state.</p>}
              {settingsPanel === "Account" && <p className="text-sm text-slate-400">Account profile saved for {accountName} at {accountEmail}.</p>}
              {settingsPanel === "Privacy" && <p className="text-sm text-slate-400">Privacy controls saved. Private mode {privateMode ? "enabled" : "disabled"}, location history {locationHistory ? "enabled" : "disabled"}, smart linking {autoLinking ? "enabled" : "disabled"}.</p>}
              {settingsPanel === "Interface" && <p className="text-sm text-slate-400">Interface preferences persisted. Notifications {toastDuration === 0 ? "stay open until dismissed" : `auto-dismiss after ${toastDuration / 1000} seconds`}.</p>}
              {settingsPanel === "Audit" && (
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>Private mode: {privateMode ? "enabled" : "disabled"}</li>
                  <li>Location history: {locationHistory ? "enabled" : "disabled"}</li>
                  <li>Smart linking: {autoLinking ? "enabled" : "disabled"}</li>
                  <li>Encrypted backups: {encryptedBackups ? "enabled" : "disabled"}</li>
                  <li>Backup schedule: {backupSchedule}</li>
                  <li>Offline queue: {offlineQueue.length} pending item(s)</li>
                  <li>Local records: {records.length}</li>
                  <li>Graph links: {links.length}</li>
                </ul>
              )}
              {settingsPanel === "Storage" && (
                <div className="space-y-2">
                  <div className="h-2 bg-slate-800"><div className="h-full bg-cyan" style={{ width: `${Math.min(100, records.length * 8)}%` }} /></div>
                  <p className="text-sm text-slate-400">{records.length} records, {links.length} links, {offlineQueue.length} queued offline captures.</p>
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function ProfilePage() {
  return (
    <div className="mx-auto min-h-full max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">Profile</div>
        <h1 className="mt-2 text-3xl font-light md:text-4xl">Archive Operator</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]">
        <Panel title="Identity Core" meta="session persistent">
          <div className="grid place-items-center border border-cyan/15 bg-cyan/5 py-12">
            <Users className="mb-4 size-16 text-cyan" />
            <div className="text-xl">demo@memoryos.local</div>
            <div className="text-sm text-slate-500">JWT-backed secure session</div>
          </div>
        </Panel>
        <Panel title="Personal Graph" meta="export ready">
          <div className="grid gap-3 md:grid-cols-3">
            {memories.slice(0, 6).map((memory) => (
              <div key={memory.id} className="border border-cyan/10 bg-void p-4">
                <div className="font-mono text-xs text-cyan">{memory.kind}</div>
                <div className="mt-2 text-sm">{memory.title}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
