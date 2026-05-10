import { Link2, Sparkles } from "lucide-react";
import { findLinkSuggestions } from "../lib/memoryAnalysis";
import { useMemoryStore } from "../store/useMemoryStore";

export function SmartLinkPanel() {
  const records = useMemoryStore((state) => state.records);
  const links = useMemoryStore((state) => state.links);
  const acceptLink = useMemoryStore((state) => state.acceptLink);
  const notify = useMemoryStore((state) => state.notify);
  const suggestions = findLinkSuggestions(records, links);

  return (
    <div className="space-y-3">
      {suggestions.length === 0 && <p className="text-sm text-slate-500">No pending suggestions. New captures will be scored by tags, dates, locations, and recurring names.</p>}
      {suggestions.map((suggestion) => (
        <button
          key={`${suggestion.source.id}-${suggestion.target.id}`}
          onClick={() => {
            acceptLink(suggestion.source.id, suggestion.target.id, suggestion.reasons[0], suggestion.strength);
            notify(`Linked ${suggestion.source.title} to ${suggestion.target.title}.`);
          }}
          className="w-full border border-cyan/12 bg-void p-3 text-left hover:border-cyan/45"
        >
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-slate-100"><Link2 className="size-4 text-cyan" /> {suggestion.source.title}</span>
            <span className="font-mono text-xs text-cyan">{Math.min(suggestion.strength, 99)}%</span>
          </div>
          <div className="text-sm text-slate-400">{suggestion.target.title}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestion.reasons.map((reason) => (
              <span key={reason} className="inline-flex items-center gap-1 border border-cyan/10 px-2 py-1 text-xs text-cyan/80">
                <Sparkles className="size-3" /> {reason}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
