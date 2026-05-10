import { Background, Controls, MiniMap, ReactFlow, useEdgesState, useNodesState } from "@xyflow/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Link2, Maximize2, Plus, Radar, Route, Search, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Group } from "three";
import { ActionButton } from "../components/ActionButton";
import { MemoryNode } from "../components/MemoryNode";
import { Panel } from "../components/Panel";
import { SmartLinkPanel } from "../components/SmartLinkPanel";
import type { MemoryRecord } from "../data/memoryData";
import { useMemoryStore } from "../store/useMemoryStore";

const nodeTypes = { memory: MemoryNode };

export function MemorySpace() {
  const selectedId = useMemoryStore((state) => state.selectedId);
  const setSelected = useMemoryStore((state) => state.setSelected);
  const addRecord = useMemoryStore((state) => state.addRecord);
  const acceptLink = useMemoryStore((state) => state.acceptLink);
  const records = useMemoryStore((state) => state.records);
  const links = useMemoryStore((state) => state.links);
  const { pathname } = useLocation();
  const generatedNodes = useMemo(() => records.map((memory, index) => {
    const ring = Math.floor(index / 6) + 1;
    const angle = (index * 137.5 * Math.PI) / 180;
    const radius = 180 + ring * 115;
    return {
      id: memory.id,
      type: "memory",
      position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
      data: memory
    };
  }), [records]);
  const generatedEdges = useMemo(() => links.map((link) => ({
    id: link.id,
    source: link.sourceId,
    target: link.targetId,
    animated: true,
    label: link.label,
    style: {
      stroke: link.strength > 75 ? "rgba(255, 200, 106, .72)" : "rgba(98, 240, 255, .55)",
      strokeWidth: 1 + link.strength / 42
    }
  })), [links]);
  const [nodes, , onNodesChange] = useNodesState(generatedNodes);
  const [edges, , onEdgesChange] = useEdgesState(generatedEdges);
  const [scrub, setScrub] = useState(62);
  const [mode, setMode] = useState<"focus" | "connect" | "replay" | "inspect" | "groups" | "radial" | "constellation">("inspect");
  const [visualMode, setVisualMode] = useState<"canvas" | "constellation">("canvas");
  const [rotationTarget, setRotationTarget] = useState({ x: 0.2, y: -0.35 });
  const [zoom, setZoom] = useState(7);
  const selected = records.find((memory) => memory.id === selectedId) ?? records[0];
  const filteredNodes = useMemo(() => {
    const nodeIds = new Set(nodes.map((node) => node.id));
    const merged = [
      ...nodes,
      ...generatedNodes.filter((node) => !nodeIds.has(node.id))
    ];
    return merged.map((node) => ({ ...node, selected: node.id === selectedId }));
  }, [generatedNodes, nodes, selectedId]);
  const displayedEdges = useMemo(() => {
    const edgeIds = new Set(edges.map((edge) => edge.id));
    return [...edges, ...generatedEdges.filter((edge) => !edgeIds.has(edge.id))];
  }, [edges, generatedEdges]);
  const relatedRecords = useMemo(() => records.filter((record) => record.id !== selected.id && (record.tags.some((tag) => selected.tags.includes(tag)) || record.emotion === selected.emotion || record.location === selected.location)).slice(0, 5), [records, selected]);
  const isNodesRoute = pathname === "/nodes";

  const createNode = () => {
    const child = {
      id: `node-${Date.now()}`,
      title: `${selected.title} Branch`,
      kind: selected.kind,
      date: new Date().toISOString().slice(0, 10),
      sector: selected.sector,
      emotion: selected.emotion,
      intensity: Math.min(100, selected.intensity + 4),
      tags: ["branch", ...selected.tags.slice(0, 3)],
      location: selected.location,
      weather: selected.weather,
      audio: selected.audio,
      summary: `A new spatial branch created from ${selected.title}.`
    };
    addRecord(child);
    acceptLink(selected.id, child.id, "spatial branch", 72);
    setSelected(child.id);
    setMode("focus");
  };

  if (isNodesRoute) {
    return (
      <div className="relative h-full min-h-[760px] overflow-hidden lg:min-h-[calc(100vh-7.5rem)]">
        <div className="absolute left-4 right-4 top-4 z-20 max-w-lg sm:left-5 sm:right-auto sm:top-5">
          <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">Node Atlas</div>
          <h1 className="mt-2 text-2xl font-light text-slate-100 md:text-4xl">Quiet graph control.</h1>
          <p className="mt-3 hidden max-w-md text-sm leading-6 text-slate-400 sm:block">
            A cleaner operating view for arranging memory nodes without the cinematic control panels crowding the canvas.
          </p>
        </div>

        <div className="absolute right-4 top-4 z-30 flex rounded-lg border border-cyan/15 bg-void/85 p-1 shadow-[0_18px_60px_rgba(0,0,0,.35)] sm:right-5 sm:top-5">
          <button onClick={() => setVisualMode("canvas")} className={`rounded-md px-3 py-2 text-xs ${visualMode === "canvas" ? "bg-cyan/10 text-cyan" : "text-slate-400 hover:text-slate-200"}`}>Map</button>
          <button onClick={() => { setVisualMode("constellation"); setMode("constellation"); }} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs ${visualMode === "constellation" ? "bg-cyan/10 text-cyan" : "text-slate-400 hover:text-slate-200"}`}><Box className="size-3" />3D</button>
        </div>

        <div className="absolute inset-0">
          {visualMode === "canvas" ? (
            <ReactFlow
              nodes={filteredNodes}
              edges={displayedEdges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(_, node) => setSelected(node.id)}
              fitView
              minZoom={0.18}
              maxZoom={2.4}
            >
              <Background color="rgba(98, 240, 255, .14)" gap={40} />
              <MiniMap nodeColor="#49b8ff" pannable zoomable className="!bottom-5 !left-5 !right-auto !rounded-lg !border !border-cyan/15 !bg-void/80" />
              <Controls showInteractive className="!bottom-36 !left-5 !rounded-lg !border !border-cyan/15 !bg-void/80" />
            </ReactFlow>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(98,240,255,.08),transparent_34rem)]">
              <Canvas
                key={zoom}
                camera={{ position: [0, 0, zoom], fov: 58 }}
                onPointerMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  setRotationTarget({
                    x: ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.6,
                    y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.8,
                  });
                }}
              >
                <ambientLight intensity={0.7} />
                <pointLight position={[4, 4, 4]} intensity={1.4} color="#62f0ff" />
                <MemoryConstellation records={records} selectedId={selectedId} rotationTarget={rotationTarget} onSelect={setSelected} />
              </Canvas>
            </div>
          )}
        </div>

        <div className="absolute bottom-[22rem] left-4 right-4 z-30 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-cyan/15 bg-void/85 p-2 shadow-[0_18px_70px_rgba(0,0,0,.45)] backdrop-blur-xl md:bottom-5 md:left-1/2 md:right-auto md:w-[min(680px,calc(100%-2.5rem))] md:-translate-x-1/2 xl:w-[min(640px,calc(100%-32rem))]">
          <ActionButton icon={Search} label="Inspect" onClick={() => setMode("inspect")} />
          <ActionButton icon={Maximize2} label="Focus" onClick={() => setMode("focus")} />
          <ActionButton icon={Link2} label="Connect" onClick={() => setMode("connect")} />
          <ActionButton icon={Plus} label="Add Node" onClick={createNode} />
          <ActionButton icon={Box} label="3D Map" onClick={() => { setVisualMode("constellation"); setMode("constellation"); }} />
        </div>

        <aside className="absolute bottom-4 left-4 right-4 z-30 max-h-[20rem] overflow-y-auto rounded-lg border border-cyan/15 bg-void/88 p-4 shadow-[0_24px_90px_rgba(0,0,0,.52)] backdrop-blur-xl md:bottom-20 md:left-auto md:right-5 md:top-28 md:max-h-none md:w-[min(350px,calc(100%-2.5rem))] xl:bottom-5 xl:w-[370px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-[.24em] text-cyan">{selected.kind}</div>
              <h2 className="mt-2 text-2xl font-light text-slate-100">{selected.title}</h2>
            </div>
            <span className="rounded-md border border-cyan/15 bg-cyan/5 px-2 py-1 font-mono text-xs text-cyan">{selected.intensity}%</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{selected.summary}</p>

          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div className="rounded-md border border-cyan/10 bg-cyan/5 p-3"><span className="block text-cyan">Date</span>{selected.date}</div>
            <div className="rounded-md border border-cyan/10 bg-cyan/5 p-3"><span className="block text-cyan">Emotion</span>{selected.emotion}</div>
            <div className="rounded-md border border-cyan/10 bg-cyan/5 p-3"><span className="block text-cyan">Sector</span>{selected.sector}</div>
            <div className="rounded-md border border-cyan/10 bg-cyan/5 p-3"><span className="block text-cyan">Linked</span>{relatedRecords.length}</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <button key={tag} onClick={() => setMode("groups")} className="rounded-md border border-cyan/15 bg-cyan/5 px-2 py-1 font-mono text-xs text-cyan/80 hover:border-cyan/40">
                {tag}
              </button>
            ))}
          </div>

          <MemoryModePanel
            mode={mode}
            selected={selected}
            relatedRecords={relatedRecords}
            onClose={() => setMode("inspect")}
            onConnect={(targetId) => {
              acceptLink(selected.id, targetId, "manual association", 78);
              setMode("inspect");
            }}
          />

          {visualMode === "constellation" && (
            <label className="mt-4 block text-xs text-slate-400">
              Orbit depth
              <input value={zoom} onChange={(event) => setZoom(Number(event.target.value))} type="range" min="4.8" max="10" step="0.2" className="mt-2 w-full accent-cyan" />
            </label>
          )}
        </aside>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[760px]">
      <div className="absolute left-5 top-5 z-20 max-w-xl">
        <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">The Memory Space</div>
        <h1 className="mt-2 text-3xl font-light text-slate-100 md:text-4xl">A living spatial archive.</h1>
      </div>
      <div className="absolute right-5 top-5 z-30 flex rounded-lg border border-cyan/15 bg-void/80 p-1">
        <button onClick={() => setVisualMode("canvas")} className={`rounded-md px-3 py-2 text-xs ${visualMode === "canvas" ? "bg-cyan/10 text-cyan" : "text-slate-400"}`}>Map</button>
        <button onClick={() => { setVisualMode("constellation"); setMode("constellation"); }} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs ${visualMode === "constellation" ? "bg-cyan/10 text-cyan" : "text-slate-400"}`}><Box className="size-3" />3D</button>
      </div>
      <div className="absolute inset-0">
        {visualMode === "canvas" ? (
          <ReactFlow
            nodes={filteredNodes}
            edges={displayedEdges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelected(node.id)}
            fitView
            minZoom={0.18}
            maxZoom={2.4}
          >
            <Background color="rgba(98, 240, 255, .16)" gap={34} />
            <MiniMap nodeColor="#49b8ff" pannable zoomable />
            <Controls showInteractive />
          </ReactFlow>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(98,240,255,.08),transparent_34rem)]">
            <Canvas
              key={zoom}
              camera={{ position: [0, 0, zoom], fov: 58 }}
              onPointerMove={(event) => {
                const bounds = event.currentTarget.getBoundingClientRect();
                setRotationTarget({
                  x: ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.6,
                  y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.8,
                });
              }}
            >
              <ambientLight intensity={0.7} />
              <pointLight position={[4, 4, 4]} intensity={1.4} color="#62f0ff" />
              <MemoryConstellation records={records} selectedId={selectedId} rotationTarget={rotationTarget} onSelect={setSelected} />
            </Canvas>
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute right-8 top-8 z-10 size-52 rounded-full border border-cyan/20">
        <div className="radar-sweep absolute left-1/2 top-1/2 h-1/2 w-px origin-top bg-cyan/50" />
        <div className="absolute inset-8 rounded-full border border-cyan/10" />
        <div className="absolute inset-16 rounded-full border border-cyan/10" />
      </div>
      <div className="absolute bottom-4 left-4 right-4 z-20 grid max-h-[44vh] gap-3 overflow-y-auto pr-1 xl:grid-cols-[1fr_320px_320px]">
        <Panel title={selected.title} meta={`${selected.kind} / ${selected.sector}`}>
          <p className="text-sm leading-6 text-slate-300">{selected.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <span key={tag} className="border border-cyan/15 bg-cyan/5 px-2 py-1 font-mono text-xs text-cyan/80">{tag}</span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <ActionButton icon={Maximize2} label="Focus" onClick={() => setMode("focus")} />
            <ActionButton icon={Link2} label="Connect" onClick={() => setMode("connect")} />
            <ActionButton icon={Route} label="Replay" onClick={() => setMode("replay")} />
            <ActionButton icon={Search} label="Inspect" onClick={() => setMode("inspect")} />
          </div>
          <MemoryModePanel
            mode={mode}
            selected={selected}
            relatedRecords={relatedRecords}
            onClose={() => setMode("inspect")}
            onConnect={(targetId) => {
              acceptLink(selected.id, targetId, "manual association", 78);
              setMode("inspect");
            }}
          />
        </Panel>
        <Panel title="Temporal Scrubber" meta="cinematic replay">
          <input value={scrub} onChange={(event) => setScrub(Number(event.target.value))} type="range" min="0" max="100" className="w-full accent-cyan" />
          <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
            <button onClick={() => setMode("groups")} className="border border-cyan/15 p-3 hover:border-cyan/40"><Radar className="mx-auto mb-2 size-4 text-cyan" />Groups</button>
            <button onClick={createNode} className="border border-cyan/15 p-3 hover:border-cyan/40"><Plus className="mx-auto mb-2 size-4 text-cyan" />Node</button>
            <button onClick={() => { setMode("constellation"); setVisualMode("constellation"); }} className="border border-cyan/15 p-3 hover:border-cyan/40"><Maximize2 className="mx-auto mb-2 size-4 text-cyan" />3D</button>
          </div>
          {visualMode === "constellation" && (
            <label className="mt-4 block text-xs text-slate-400">
              Orbit depth
              <input value={zoom} onChange={(event) => setZoom(Number(event.target.value))} type="range" min="4.8" max="10" step="0.2" className="mt-2 w-full accent-cyan" />
            </label>
          )}
        </Panel>
        <Panel title="Smart Memory Linking" meta="metadata suggestions">
          <SmartLinkPanel />
        </Panel>
      </div>
      <AnimatePresence>
        <motion.div
          className="pointer-events-none absolute inset-0 border border-cyan/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrub / 180 }}
          exit={{ opacity: 0 }}
        />
      </AnimatePresence>
    </div>
  );
}

function MemoryConstellation({
  records,
  selectedId,
  rotationTarget,
  onSelect
}: {
  records: MemoryRecord[];
  selectedId: string;
  rotationTarget: { x: number; y: number };
  onSelect: (id: string) => void;
}) {
  const group = useRef<Group>(null);
  const positions = useMemo(() => records.map((record, index) => {
    const ring = Math.floor(index / 7) + 1;
    const angle = index * 1.72;
    const radius = 1.4 + ring * 0.42;
    return {
      record,
      position: [Math.cos(angle) * radius, Math.sin(index * 0.74) * 0.72, Math.sin(angle) * radius] as [number, number, number],
      color: record.kind === "dream" ? "#ffc86a" : record.kind === "relationship" ? "#fb7185" : record.kind === "project" ? "#86efac" : "#62f0ff"
    };
  }), [records]);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.x += (rotationTarget.x - group.current.rotation.x) * Math.min(1, delta * 3.2);
    group.current.rotation.y += (rotationTarget.y - group.current.rotation.y) * Math.min(1, delta * 3.2);
    group.current.rotation.z += delta * 0.03;
  });

  return (
    <group ref={group}>
      {positions.map(({ record, position, color }, index) => {
        const selected = record.id === selectedId;
        return (
          <group key={record.id} position={position}>
            <mesh onClick={(event) => { event.stopPropagation(); onSelect(record.id); }} scale={selected ? 1.35 : 1}>
              <sphereGeometry args={[0.08 + record.intensity / 900, 24, 24]} />
              <meshStandardMaterial emissive={color} emissiveIntensity={selected ? 1.8 : 0.75} color={color} roughness={0.25} metalness={0.25} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} scale={selected ? 1.35 : 1}>
              <torusGeometry args={[0.17 + record.intensity / 600, 0.004, 8, 42]} />
              <meshBasicMaterial color={color} transparent opacity={selected ? 0.72 : 0.24} />
            </mesh>
            {index % 3 === 0 && (
              <mesh position={[0, -0.18, 0]} scale={[0.008, 0.008, 0.65]} rotation={[Math.PI / 2, 0, index]}>
                <boxGeometry />
                <meshBasicMaterial color={color} transparent opacity={0.28} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

function MemoryModePanel({
  mode,
  selected,
  relatedRecords,
  onClose,
  onConnect
}: {
  mode: "focus" | "connect" | "replay" | "inspect" | "groups" | "radial" | "constellation";
  selected: ReturnType<typeof useMemoryStore.getState>["records"][number];
  relatedRecords: ReturnType<typeof useMemoryStore.getState>["records"];
  onClose: () => void;
  onConnect: (targetId: string) => void;
}) {
  return (
    <div className="mt-4 border border-cyan/10 bg-void/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[.22em] text-cyan">{mode} mode</span>
        {mode !== "inspect" && (
          <button onClick={onClose} className="grid size-7 place-items-center border border-cyan/15 hover:border-cyan/40">
            <X className="size-3" />
          </button>
        )}
      </div>
      {mode === "focus" && (
        <div className="space-y-3">
          <div className="text-xl text-slate-100">{selected.title}</div>
          <p className="text-sm leading-6 text-slate-400">{selected.summary}</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{selected.intensity}%</span>intensity</div>
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{selected.emotion}</span>emotion</div>
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{relatedRecords.length}</span>related</div>
          </div>
        </div>
      )}
      {mode === "connect" && (
        <div className="space-y-2">
          {relatedRecords.map((record) => (
            <button key={record.id} onClick={() => onConnect(record.id)} className="flex w-full items-center justify-between border border-cyan/10 p-2 text-left text-sm hover:border-cyan/40">
              <span>{record.title}</span>
              <Link2 className="size-4 text-cyan" />
            </button>
          ))}
          {relatedRecords.length === 0 && <p className="text-sm text-slate-500">No close candidates yet. Capture more related records to link manually.</p>}
        </div>
      )}
      {mode === "replay" && (
        <div className="space-y-2">
          {[selected, ...relatedRecords].map((record, index) => (
            <div key={record.id} className="flex items-center gap-3 border border-cyan/10 p-2">
              <span className="grid size-7 place-items-center border border-cyan/15 font-mono text-xs text-cyan">{index + 1}</span>
              <span className="text-sm">{record.date} / {record.title}</span>
            </div>
          ))}
        </div>
      )}
      {mode === "groups" && (
        <div className="grid grid-cols-2 gap-2">
          {[selected.kind, selected.sector, selected.emotion, selected.location ?? "unknown"].map((group) => (
            <div key={group} className="border border-cyan/10 p-3 text-sm text-slate-300">{group}</div>
          ))}
        </div>
      )}
      {mode === "radial" && (
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {["focus", "connect", "tag", "replay"].map((item) => (
            <button key={item} className="border border-cyan/15 p-3 hover:border-cyan/40">{item}</button>
          ))}
        </div>
      )}
      {mode === "constellation" && (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-400">3D constellation mode is active. Move over the scene to rotate the neural cluster, select glowing nodes to inspect memory data, and adjust orbit depth in the scrubber panel.</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{relatedRecords.length + 1}</span>cluster</div>
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{selected.kind}</span>kind</div>
            <div className="border border-cyan/10 p-2"><span className="block text-cyan">{selected.intensity}%</span>signal</div>
          </div>
        </div>
      )}
      {mode === "inspect" && (
        <dl className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="border border-cyan/10 p-2"><dt className="text-cyan">Date</dt><dd>{selected.date}</dd></div>
          <div className="border border-cyan/10 p-2"><dt className="text-cyan">Weather</dt><dd>{selected.weather ?? "untracked"}</dd></div>
          <div className="border border-cyan/10 p-2"><dt className="text-cyan">Location</dt><dd>{selected.location ?? "untracked"}</dd></div>
          <div className="border border-cyan/10 p-2"><dt className="text-cyan">Audio</dt><dd>{selected.audio ?? "none"}</dd></div>
        </dl>
      )}
    </div>
  );
}
