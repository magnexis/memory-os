import * as Tabs from "@radix-ui/react-tabs";
import type { EChartsOption } from "echarts";
import { Pause, Play, ScanLine, SkipBack, SkipForward, ZoomIn, ZoomOut } from "lucide-react";
import { useMemo, useState } from "react";
import { MemoryChart } from "../components/MemoryChart";
import { Panel } from "../components/Panel";
import { useGsapPage } from "../hooks/useGsapPage";
import { buildHeatmap } from "../lib/memoryAnalysis";
import { useMemoryStore } from "../store/useMemoryStore";

export function Timeline() {
  const pageRef = useGsapPage<HTMLDivElement>();
  const density = useMemoryStore((state) => state.density);
  const setDensity = useMemoryStore((state) => state.setDensity);
  const records = useMemoryStore((state) => state.records);
  const notify = useMemoryStore((state) => state.notify);
  const [playing, setPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const timelineEvents = useMemo(() => records.slice().sort((a, b) => a.date.localeCompare(b.date)), [records]);
  const heatmap = useMemo(() => buildHeatmap(records), [records]);
  const selectedEvent = timelineEvents[selectedIndex] ?? timelineEvents[0];
  const jump = (direction: -1 | 1) => setSelectedIndex((index) => Math.min(Math.max(index + direction, 0), Math.max(timelineEvents.length - 1, 0)));
  const densityOption = useMemo<EChartsOption>(() => ({
    backgroundColor: "transparent",
    tooltip: { trigger: "axis" },
    grid: { left: 34, right: 18, top: 24, bottom: 32 },
    xAxis: { type: "category", data: heatmap.map((month) => month.label), axisLabel: { color: "#9fb8c7" }, axisLine: { lineStyle: { color: "rgba(98,240,255,.16)" } } },
    yAxis: { type: "value", max: 100, splitLine: { lineStyle: { color: "rgba(98,240,255,.08)" } }, axisLabel: { color: "#9fb8c7" } },
    series: [
      { name: "Density", type: "line", smooth: true, data: heatmap.map((month) => Math.round(month.activity * 100)), lineStyle: { color: "#62f0ff", width: 2 }, areaStyle: { color: "rgba(98,240,255,.14)" }, symbolSize: 7 },
      { name: "Places", type: "bar", data: heatmap.map((month) => month.places * 16), itemStyle: { color: "rgba(255,200,106,.62)", borderRadius: [4, 4, 0, 0] }, barWidth: 10 }
    ]
  }), [heatmap]);

  return (
    <div ref={pageRef} className="mx-auto min-h-full max-w-[var(--memory-page-max-w)] p-[var(--memory-page-pad)] md:p-[var(--memory-page-pad-lg)]">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">Timeline</div>
          <h1 className="mt-2 text-3xl font-light md:text-4xl">Cinematic memory rail.</h1>
        </div>
        <div className="flex gap-2">
          {[SkipBack, playing ? Pause : Play, SkipForward].map((Icon, index) => (
            <button key={index} onClick={() => index === 1 ? setPlaying((value) => !value) : jump(index === 0 ? -1 : 1)} className="grid size-10 place-items-center rounded-md border border-cyan/20 bg-ink/70 hover:border-cyan">
              <Icon className="size-4 text-cyan" />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs.Root value={density} onValueChange={(value) => setDensity(value as typeof density)}>
          <Tabs.List className="flex w-fit rounded-lg border border-cyan/15 bg-void p-1">
            {["year", "month", "week", "day"].map((item) => (
              <Tabs.Trigger key={item} value={item} className="rounded-md px-4 py-2 text-sm text-slate-400 data-[state=active]:bg-cyan/10 data-[state=active]:text-cyan">
                {item}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
        <div className="flex items-center gap-2 rounded-lg border border-cyan/15 bg-void p-1">
          <button onClick={() => setZoom((value) => Math.max(0.72, value - 0.12))} className="grid size-8 place-items-center rounded-md hover:bg-cyan/10"><ZoomOut className="size-4 text-cyan" /></button>
          <div className="w-16 text-center font-mono text-xs text-slate-400">{Math.round(zoom * 100)}%</div>
          <button onClick={() => setZoom((value) => Math.min(1.55, value + 0.12))} className="grid size-8 place-items-center rounded-md hover:bg-cyan/10"><ZoomIn className="size-4 text-cyan" /></button>
        </div>
      </div>

      <section className="gsap-panel relative overflow-hidden rounded-xl border border-cyan/15 bg-ink/70 p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(98,240,255,.12),transparent_34rem)]" />
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-cyan/25" />
        <div className="pointer-events-none absolute left-0 right-0 top-[calc(50%+34px)] h-px bg-gold/15" />
        <div className="relative overflow-x-auto pb-4">
          <div className="flex min-w-[980px] items-center gap-7 px-2 py-12" style={{ transform: `scale(${zoom})`, transformOrigin: "left center", width: `${100 / zoom}%` }}>
            {timelineEvents.map((event, index) => {
              const selected = selectedIndex === index;
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedIndex(index)}
                  onMouseEnter={() => notify(`${event.title} preview armed.`)}
                  className={`group relative flex w-40 shrink-0 flex-col items-center gap-3 rounded-lg border p-3 text-center transition ${
                    selected ? "border-gold/55 bg-gold/10 text-gold shadow-signal" : "border-cyan/12 bg-void/70 text-slate-300 hover:border-cyan/40 hover:bg-cyan/5"
                  }`}
                >
                  <span className={`absolute -top-10 left-1/2 size-4 -translate-x-1/2 rounded-full ${selected ? "bg-gold" : "bg-cyan"} shadow-signal`}>
                    {playing && selected && <span className="absolute inset-[-10px] rounded-full border border-gold/40 animate-ping" />}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[.18em] text-cyan/80">{event.date}</span>
                  <span className="line-clamp-2 min-h-10 text-sm text-slate-100">{event.title}</span>
                  <span className="h-16 w-full rounded-md border border-cyan/10 bg-cyan/5" style={{ opacity: 0.22 + event.intensity / 130 }} />
                  <span className="text-[11px] text-slate-500">{event.emotion} / {event.kind}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_380px]">
        <Panel title="Density Field" meta="animated period analysis">
          <MemoryChart option={densityOption} className="h-72" />
        </Panel>
        <Panel title="Playback Inspector" meta={playing ? "camera traversal active" : "paused"}>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-cyan/10 bg-void p-3">
                <ScanLine className="size-5 text-cyan" />
                <div>
                  <div className="text-lg text-slate-100">{selectedEvent.title}</div>
                  <div className="font-mono text-xs uppercase tracking-[.18em] text-cyan/70">{selectedEvent.date} / {selectedEvent.sector}</div>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-400">{selectedEvent.summary}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-md border border-cyan/10 p-3"><span className="block text-cyan">{selectedEvent.intensity}%</span>intensity</div>
                <div className="rounded-md border border-cyan/10 p-3"><span className="block text-cyan">{selectedEvent.emotion}</span>emotion</div>
                <div className="rounded-md border border-cyan/10 p-3"><span className="block text-cyan">{density}</span>zoom</div>
              </div>
              <div className="relative h-32 overflow-hidden rounded-lg border border-cyan/10 bg-void">
                <div className="tactical-grid absolute inset-0 opacity-60" />
                <div className={`absolute left-[18%] top-[42%] size-2 rounded-full ${playing ? "bg-gold shadow-signal" : "bg-cyan"}`} />
                <div className="absolute left-[54%] top-[24%] size-2 rounded-full bg-cyan" />
                <div className="absolute left-[78%] top-[68%] size-2 rounded-full bg-rose" />
                <svg className="absolute inset-0 h-full w-full">
                  <path d="M42 78 C 118 18, 178 112, 252 48 S 346 84, 430 62" fill="none" stroke="rgba(98,240,255,.5)" strokeWidth="2" strokeDasharray="8 8" />
                </svg>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
