import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { motion } from "framer-motion";
import { Archive, Brain, Lightbulb, MapPin, Moon, Music, Sparkles, Users } from "lucide-react";
import type { MemoryRecord } from "../data/memoryData";
import { useMemoryStore } from "../store/useMemoryStore";

const icons = {
  memory: Sparkles,
  project: Brain,
  relationship: Users,
  location: MapPin,
  idea: Lightbulb,
  dream: Moon,
  music: Music,
  media: Archive
};

export function MemoryNode({ data, selected }: NodeProps) {
  const record = data as unknown as MemoryRecord;
  const Icon = icons[record.kind];
  const setSelected = useMemoryStore((state) => state.setSelected);
  const notify = useMemoryStore((state) => state.notify);
  const animation = useMemoryStore((state) => state.animation);
  const glow = useMemoryStore((state) => state.glow);
  const hoverScale = 1 + (animation / 100) * 0.055;
  const selectedGlow = 12 + glow * 0.42;

  return (
    <motion.button
      whileHover={{ scale: hoverScale }}
      transition={{ type: "spring", stiffness: 180 + animation * 2.6, damping: 24 }}
      onDoubleClick={() => notify(`${record.title} opened in focus mode.`)}
      onClick={() => setSelected(record.id)}
      style={{
        width: "var(--memory-node-w)",
        padding: "var(--memory-node-pad)",
        boxShadow: selected ? `0 0 ${selectedGlow}px rgba(98, 240, 255, ${0.14 + glow / 260})` : undefined
      }}
      className={`border bg-ink/95 text-left shadow-node transition ${
        selected ? "border-cyan text-cyan" : "border-cyan/20 text-slate-100 hover:border-cyan/50"
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-cyan" />
      <Handle type="source" position={Position.Right} className="!bg-cyan" />
      <div className="mb-3 flex items-center justify-between">
        <div className="grid size-10 place-items-center border border-cyan/20 bg-cyan/10">
          <Icon className="size-5" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[.22em] text-slate-500">{record.kind}</span>
      </div>
      <div className="text-base font-medium">{record.title}</div>
      <div className="mt-1 text-xs text-slate-500">{record.date} / {record.emotion}</div>
      <div className="mt-3 h-1 bg-slate-800">
        <div className="h-full bg-cyan" style={{ width: `${record.intensity}%` }} />
      </div>
    </motion.button>
  );
}
