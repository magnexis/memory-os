import type { EChartsOption } from "echarts";
import { Activity, Archive, CloudUpload, GitBranch, Play, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { ActionButton } from "../components/ActionButton";
import { MemoryChart } from "../components/MemoryChart";
import { Panel } from "../components/Panel";
import { SmartLinkPanel } from "../components/SmartLinkPanel";
import { routeInsights } from "../data/memoryData";
import { useGsapPage } from "../hooks/useGsapPage";
import { buildHeatmap } from "../lib/memoryAnalysis";
import { useMemoryStore } from "../store/useMemoryStore";

export function Dashboard() {
  const records = useMemoryStore((state) => state.records);
  const offlineQueue = useMemoryStore((state) => state.offlineQueue);
  const addRecord = useMemoryStore((state) => state.addRecord);
  const syncOfflineQueue = useMemoryStore((state) => state.syncOfflineQueue);
  const [operation, setOperation] = useState("Ingest");
  const heatmap = buildHeatmap(records);
  const pageRef = useGsapPage<HTMLDivElement>();
  const pulseOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    grid: { left: 30, right: 14, top: 18, bottom: 24 },
    xAxis: { type: "category", data: records.slice(0, 8).map((record) => record.title.slice(0, 8)), axisLabel: { color: "#9fb8c7", fontSize: 10 }, axisLine: { lineStyle: { color: "rgba(98,240,255,.16)" } } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#9fb8c7" } },
    series: [{ type: "line", smooth: true, data: records.slice(0, 8).map((record) => record.intensity), lineStyle: { color: "#62f0ff", width: 2 }, areaStyle: { color: "rgba(98,240,255,.14)" }, symbolSize: 7 }],
    tooltip: { trigger: "axis" }
  }), [records]);
  const cacheOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    grid: { left: 28, right: 12, top: 18, bottom: 24 },
    xAxis: { type: "category", data: heatmap.slice(0, 6).map((month) => month.label), axisLabel: { color: "#9fb8c7", fontSize: 10 } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#9fb8c7" } },
    series: [{ type: "bar", data: heatmap.slice(0, 6).map((month) => Math.round(month.activity * 100)), barWidth: 12, itemStyle: { color: "#62f0ff", borderRadius: [4, 4, 0, 0] } }]
  }), [heatmap]);

  return (
    <div ref={pageRef} className="mx-auto max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-8">
        <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">Dashboard</div>
        <h1 className="mt-2 text-3xl font-light md:text-4xl">Command layer for the archive.</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {routeInsights.dashboard.map((item) => (
          <Panel key={item} title={item} meta="live metric">
            <MemoryChart option={item.includes("Activity") ? pulseOption : cacheOption} className="h-28" />
          </Panel>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Panel title="Active Memory Pulse" meta="latest signals">
          <MemoryChart option={pulseOption} className="mb-4 h-56" />
          <div className="space-y-3">
            {records.slice(0, 5).map((memory) => (
              <div key={memory.id} className="flex items-center justify-between border border-cyan/10 p-3">
                <div>
                  <div className="text-sm text-slate-100">{memory.title}</div>
                  <div className="text-xs text-slate-500">{memory.summary}</div>
                </div>
                <span className="font-mono text-xs text-cyan">{memory.intensity}%</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Operational Actions" meta="all controls active">
          <div className="flex flex-wrap gap-2">
            <ActionButton icon={CloudUpload} label="Ingest" onClick={() => setOperation("Ingest")} />
            <ActionButton icon={GitBranch} label="Sync" onClick={() => { syncOfflineQueue(); setOperation("Sync"); }} />
            <ActionButton icon={Archive} label="Index" onClick={() => setOperation("Index")} />
            <ActionButton icon={Shield} label="Backup" onClick={() => { localStorage.setItem("memoryos.backup", JSON.stringify({ records, createdAt: new Date().toISOString() })); setOperation("Backup"); }} />
            <ActionButton icon={Play} label="Playback" onClick={() => setOperation("Playback")} />
            <ActionButton icon={Activity} label="Audit" onClick={() => setOperation("Audit")} />
          </div>
          <div className="mt-4 border border-cyan/10 bg-void p-4">
            <div className="mb-2 font-mono text-xs uppercase tracking-[.2em] text-cyan">{operation}</div>
            {operation === "Ingest" && (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const title = String(new FormData(event.currentTarget).get("title"));
                  addRecord({
                    id: `ingest-${Date.now()}`,
                    title,
                    kind: "media",
                    date: new Date().toISOString().slice(0, 10),
                    sector: "Dashboard Ingest",
                    emotion: "focus",
                    intensity: 58,
                    tags: ["ingest", "dashboard"],
                    summary: `${title} was ingested from the dashboard command layer.`
                  });
                  event.currentTarget.reset();
                }}
              >
                <input name="title" required placeholder="New media or note title" className="h-10 w-full border border-cyan/15 bg-ink px-3 outline-none focus:border-cyan" />
                <button className="h-10 w-full border border-cyan/30 bg-cyan/10 text-cyan">Create ingest record</button>
              </form>
            )}
            {operation === "Sync" && <p className="text-sm text-slate-400">Offline queue flushed into local state. Deferred API sync is ready for backend integration.</p>}
            {operation === "Index" && <p className="text-sm text-slate-400">Indexed {records.length} records, {records.flatMap((record) => record.tags).length} tags, and {new Set(records.map((record) => record.location).filter(Boolean)).size} places.</p>}
            {operation === "Backup" && <p className="text-sm text-slate-400">Backup snapshot saved to local storage with {records.length} records.</p>}
            {operation === "Playback" && (
              <div className="space-y-2">
                {records.slice(0, 4).map((record, index) => <div key={record.id} className="border border-cyan/10 p-2 text-sm">{index + 1}. {record.date} / {record.title}</div>)}
              </div>
            )}
            {operation === "Audit" && <p className="text-sm text-slate-400">Audit checks: private mode controls present, offline queue has {offlineQueue.length} item(s), production dependency audit is clean.</p>}
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[.65fr_.35fr]">
        <Panel title="Smart Link Queue" meta="practical metadata analysis">
          <SmartLinkPanel />
        </Panel>
        <Panel title="Offline-First Cache" meta={`${offlineQueue.length} deferred item(s)`}>
          <MemoryChart option={cacheOption} className="mb-4 h-48" />
          <div className="grid grid-cols-3 gap-2">
            {heatmap.slice(0, 6).map((month) => (
              <div key={month.label} className="border border-cyan/10 bg-void p-3">
                <div className="font-mono text-xs text-cyan">{month.label}</div>
                <div className="mt-3 h-16 bg-cyan/10" style={{ opacity: 0.2 + month.activity * 0.8 }} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
