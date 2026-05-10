import * as Tabs from "@radix-ui/react-tabs";
import type { EChartsOption } from "echarts";
import { Activity, Archive, Braces, CheckCircle2, Cloud, Database, HardDrive, Play, Radio, Search, Server, Shield, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ActionButton } from "../components/ActionButton";
import { DeveloperConsole } from "../components/DeveloperConsole";
import { MemoryChart } from "../components/MemoryChart";
import { Panel } from "../components/Panel";
import { SmartLinkPanel } from "../components/SmartLinkPanel";
import { useGsapPage } from "../hooks/useGsapPage";
import { buildHeatmap } from "../lib/memoryAnalysis";
import { useMemoryStore } from "../store/useMemoryStore";

function Page({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  const pageRef = useGsapPage<HTMLDivElement>();
  return (
    <div ref={pageRef} className="mx-auto min-h-full max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-7">
        <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">{eyebrow}</div>
        <h1 className="mt-2 max-w-4xl text-3xl font-light text-slate-100 md:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-cyan/10 bg-void/70 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[.2em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-light text-cyan">{value}</div>
    </div>
  );
}

export function MemoryStreamPage() {
  const records = useMemoryStore((state) => state.records);
  const setSelected = useMemoryStore((state) => state.setSelected);
  const [filter, setFilter] = useState("");
  const filtered = records.filter((record) => `${record.title} ${record.summary} ${record.tags.join(" ")}`.toLowerCase().includes(filter.toLowerCase()));
  const streamOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    grid: { left: 28, right: 18, top: 18, bottom: 28 },
    xAxis: { type: "category", data: filtered.slice(0, 10).map((record) => record.title.slice(0, 10)), axisLabel: { color: "#7f9aaa", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(98,240,255,.18)" } } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#7f9aaa" } },
    series: [{ type: "bar", data: filtered.slice(0, 10).map((record) => record.intensity), barWidth: 10, itemStyle: { color: "#62f0ff", borderRadius: [4, 4, 0, 0] } }],
    tooltip: { trigger: "axis" }
  }), [filtered]);

  return (
    <Page eyebrow="Memory Stream" title="Live intake, replay, and memory operations.">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <Panel title="Stream Controls" meta="searchable event flow">
          <div className="mb-4 flex items-center gap-2 rounded-md border border-cyan/15 bg-void px-3">
            <Search className="size-4 text-cyan" />
            <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter memories, tags, summaries..." className="h-11 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <div className="space-y-2">
            {filtered.slice(0, 8).map((record) => (
              <button key={record.id} onClick={() => setSelected(record.id)} className="group flex w-full items-center justify-between rounded-md border border-cyan/10 bg-void/70 p-3 text-left hover:border-cyan/40">
                <span>
                  <span className="block text-sm text-slate-100">{record.title}</span>
                  <span className="text-xs text-slate-500">{record.date} / {record.emotion} / {record.tags.slice(0, 3).join(", ")}</span>
                </span>
                <span className="h-2 w-24 bg-slate-800"><span className="block h-full bg-cyan" style={{ width: `${record.intensity}%` }} /></span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Smart Link Queue" meta="metadata suggestions">
          <MemoryChart option={streamOption} className="mb-4 h-48" />
          <SmartLinkPanel />
        </Panel>
      </div>
    </Page>
  );
}

export function SystemPage() {
  const records = useMemoryStore((state) => state.records);
  const offlineQueue = useMemoryStore((state) => state.offlineQueue);
  const syncOfflineQueue = useMemoryStore((state) => state.syncOfflineQueue);
  const [module, setModule] = useState("Router");
  const moduleOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    radar: { indicator: [
      { name: "Router", max: 100 }, { name: "Store", max: 100 }, { name: "Realtime", max: 100 }, { name: "Auth", max: 100 }, { name: "API", max: 100 }
    ], axisName: { color: "#9fb8c7" }, splitLine: { lineStyle: { color: "rgba(98,240,255,.12)" } }, splitArea: { areaStyle: { color: ["rgba(98,240,255,.03)", "rgba(98,240,255,.06)"] } } },
    series: [{ type: "radar", data: [{ value: [92, 84, offlineQueue.length ? 72 : 90, 88, 86], name: "Runtime" }], areaStyle: { color: "rgba(98,240,255,.16)" }, lineStyle: { color: "#62f0ff" }, itemStyle: { color: "#62f0ff" } }]
  }), [offlineQueue.length]);

  return (
    <Page eyebrow="System" title="Operating layer, modules, and runtime health.">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Records" value={String(records.length)} />
        <Metric label="Queue" value={String(offlineQueue.length)} />
        <Metric label="Routes" value="18" />
        <Metric label="Runtime" value="online" />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <Panel title="Module Registry" meta={module}>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              [Server, "Router"], [Database, "Store"], [Radio, "Realtime"], [Shield, "Auth"], [Archive, "Archive"], [Braces, "API"]
            ].map(([Icon, label]) => {
              const ModuleIcon = Icon as typeof Server;
              return <button key={String(label)} onClick={() => setModule(String(label))} className={`flex h-12 items-center gap-3 rounded-md border px-3 text-sm ${module === label ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-300"}`}><ModuleIcon className="size-4" />{String(label)}</button>;
            })}
          </div>
          <div className="mt-4 rounded-md border border-cyan/10 bg-void p-4 text-sm text-slate-400">{module} module is mounted, interactive, and participating in local state persistence.</div>
        </Panel>
        <Panel title="Runtime Controls" meta="diagnostics">
          <MemoryChart option={moduleOption} className="mb-4 h-64" />
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={Wifi} label="Ping realtime" action="Realtime channel pinged." />
            <ActionButton icon={Cloud} label="Flush queue" onClick={syncOfflineQueue} />
            <ActionButton icon={HardDrive} label="Snapshot" onClick={() => localStorage.setItem("memoryos.systemSnapshot", JSON.stringify({ records, createdAt: new Date().toISOString() }))} />
          </div>
          <div className="mt-4 space-y-2">
            {["Route tree active", "Local cache writable", "Animation budget stable", "API console mounted"].map((item) => <div key={item} className="flex items-center gap-2 rounded-md border border-cyan/10 p-3 text-sm"><CheckCircle2 className="size-4 text-cyan" />{item}</div>)}
          </div>
        </Panel>
      </div>
    </Page>
  );
}

export function InsightsPage() {
  const records = useMemoryStore((state) => state.records);
  const notify = useMemoryStore((state) => state.notify);
  const heatmap = useMemo(() => buildHeatmap(records), [records]);
  const [mode, setMode] = useState("Activity");
  const insightOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { left: 34, right: 20, top: 24, bottom: 32 },
    xAxis: { type: "category", data: heatmap.map((month) => month.label), axisLabel: { color: "#9fb8c7" }, axisLine: { lineStyle: { color: "rgba(98,240,255,.16)" } } },
    yAxis: { type: "value", splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#9fb8c7" } },
    series: [
      { name: "Activity", type: "line", smooth: true, data: heatmap.map((month) => Math.round(month.activity * 100)), lineStyle: { color: "#62f0ff", width: 2 }, areaStyle: { color: "rgba(98,240,255,.12)" }, symbolSize: 6 },
      { name: "Creative", type: "bar", data: heatmap.map((month) => month.creative * 18), itemStyle: { color: "rgba(255,200,106,.65)", borderRadius: [4, 4, 0, 0] }, barWidth: 8 }
    ]
  }), [heatmap]);

  return (
    <Page eyebrow="Insights" title="Patterns, density, and archive intelligence.">
      <Tabs.Root value={mode} onValueChange={setMode}>
        <Tabs.List className="mb-4 flex w-fit rounded-lg border border-cyan/15 bg-void p-1">
          {["Activity", "Emotion", "Places", "Tags"].map((item) => <Tabs.Trigger key={item} value={item} className="rounded-md px-4 py-2 text-sm text-slate-400 data-[state=active]:bg-cyan/10 data-[state=active]:text-cyan">{item}</Tabs.Trigger>)}
        </Tabs.List>
      </Tabs.Root>
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Panel title={`${mode} Heatmap`} meta="interactive analysis">
          <MemoryChart option={insightOption} className="mb-4 h-72" />
          <div className="grid grid-cols-6 gap-2">
            {heatmap.map((month) => <button key={month.label} className="rounded-md border border-cyan/10 bg-void p-3 text-left hover:border-cyan/40"><div className="font-mono text-xs text-cyan">{month.label}</div><div className="mt-3 h-20 bg-cyan/10" style={{ opacity: 0.18 + month.activity * 0.82 }} /><div className="mt-2 text-xs text-slate-500">{Math.round(month.activity * 100)}% density</div></button>)}
          </div>
        </Panel>
        <Panel title="Insight Actions" meta={mode}>
          <div className="space-y-2">
            {["Create replay", "Export pattern", "Open related nodes", "Mark meaningful period"].map((label) => (
              <button key={label} onClick={() => notify(`${label} queued for ${mode.toLowerCase()} insights.`)} className="flex h-11 w-full items-center justify-between rounded-md border border-cyan/10 px-3 text-sm hover:border-cyan/40">
                <span>{label}</span><Activity className="size-4 text-cyan" />
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </Page>
  );
}

export function SyncPage() {
  const offlineQueue = useMemoryStore((state) => state.offlineQueue);
  const syncOfflineQueue = useMemoryStore((state) => state.syncOfflineQueue);
  const [syncMode, setSyncMode] = useState("Realtime");
  const syncOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    grid: { left: 34, right: 18, top: 22, bottom: 28 },
    xAxis: { type: "category", data: ["now", "+5m", "+10m", "+15m", "+20m", "+25m"], axisLabel: { color: "#9fb8c7" }, axisLine: { lineStyle: { color: "rgba(98,240,255,.16)" } } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#9fb8c7" } },
    series: [{ type: "line", smooth: true, data: [92, 88, 95, 89, offlineQueue.length ? 76 : 94, 97], lineStyle: { color: "#62f0ff" }, areaStyle: { color: "rgba(98,240,255,.13)" } }],
    tooltip: { trigger: "axis" }
  }), [offlineQueue.length]);

  return (
    <Page eyebrow="Sync" title="Offline queue, realtime channel, and backup flow.">
      <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
        <Panel title="Sync Diagnostics" meta={syncMode}>
          <div className="grid gap-2 sm:grid-cols-3">
            {["Realtime", "Offline", "Backup"].map((mode) => <button key={mode} onClick={() => setSyncMode(mode)} className={`rounded-md border p-3 text-sm ${syncMode === mode ? "border-cyan bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-400"}`}>{mode}</button>)}
          </div>
          <button onClick={syncOfflineQueue} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-cyan/30 bg-cyan/10 text-cyan"><Play className="size-4" /> Synchronize queue</button>
        </Panel>
        <Panel title="Queue Monitor" meta={`${offlineQueue.length} pending`}>
          <MemoryChart option={syncOption} className="mb-4 h-56" />
          {offlineQueue.length === 0 ? <div className="rounded-md border border-cyan/10 bg-void p-4 text-sm text-slate-400">No deferred captures. Offline-first queue is clear.</div> : offlineQueue.map((record) => <div key={record.id} className="mb-2 rounded-md border border-cyan/10 p-3 text-sm">{record.title}</div>)}
        </Panel>
      </div>
    </Page>
  );
}

export function DeveloperConsolePage() {
  return (
    <Page eyebrow="Developer Console" title="Keys, webhooks, env files, and MemoryOS API calls.">
      <div className="grid gap-4 xl:grid-cols-[.7fr_1.3fr]">
        <Panel title="Open Developer Workspace" meta="full console">
          <DeveloperConsole />
          <p className="mt-4 text-sm leading-6 text-slate-400">The same workspace is also available from the top header. Generated backend keys can be used with `Authorization: Bearer` against `/api/v1/status`, `/api/v1/memories`, `/api/v1/graph`, and `/api/v1/search`.</p>
        </Panel>
        <Panel title="MemoryOS API Quickstart" meta="developer surface">
          <pre className="overflow-auto rounded-md border border-cyan/10 bg-void p-4 text-xs leading-6 text-slate-300">{`curl http://localhost:4400/api/v1/status \\
  -H "Authorization: Bearer $MEMORYOS_API_KEY"`}</pre>
          <div className="mt-4 grid gap-2 md:grid-cols-3">
            {["Generate key", "Copy .env", "Run API Explorer"].map((item) => <div key={item} className="rounded-md border border-cyan/10 bg-cyan/5 p-3 text-sm text-cyan">{item}</div>)}
          </div>
        </Panel>
      </div>
    </Page>
  );
}
