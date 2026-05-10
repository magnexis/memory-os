import * as Dialog from "@radix-ui/react-dialog";
import { Mic, Paperclip, Plus, Save, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type { MemoryKind } from "../data/memoryData";
import { findLinkSuggestions } from "../lib/memoryAnalysis";
import { useMemoryStore } from "../store/useMemoryStore";

const kinds: MemoryKind[] = ["memory", "idea", "project", "dream", "media", "music", "location", "relationship"];

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const records = useMemoryStore((state) => state.records);
  const links = useMemoryStore((state) => state.links);
  const online = useMemoryStore((state) => state.online);
  const addRecord = useMemoryStore((state) => state.addRecord);
  const queueOfflineRecord = useMemoryStore((state) => state.queueOfflineRecord);
  const notify = useMemoryStore((state) => state.notify);
  const [fileNames, setFileNames] = useState<string[]>([]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record = {
      id: `capture-${Date.now()}`,
      title: String(form.get("title")),
      kind: String(form.get("kind")) as MemoryKind,
      date: String(form.get("date")) || new Date().toISOString().slice(0, 10),
      sector: "Quick Capture",
      emotion: String(form.get("emotion")) || "neutral",
      intensity: Number(form.get("intensity")) || 55,
      tags: String(form.get("tags")).split(",").map((tag) => tag.trim()).filter(Boolean),
      location: String(form.get("location")) || undefined,
      summary: String(form.get("summary")) || `Captured with ${fileNames.length} attachment reference(s).`
    };
    if (online) addRecord(record);
    else queueOfflineRecord(record);
    const suggestions = findLinkSuggestions([record, ...records], links);
    notify(suggestions.length ? `Captured. ${suggestions.length} smart link suggestion(s) ready.` : "Captured into MemoryOS.");
    setFileNames([]);
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center border border-cyan/40 bg-cyan/15 text-cyan shadow-signal transition hover:bg-cyan/25" aria-label="Quick capture">
          <Plus className="size-6" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/72" />
        <Dialog.Content className="fixed bottom-6 right-6 z-50 w-[min(94vw,560px)] border border-cyan/25 bg-ink p-5 shadow-signal">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-xl text-slate-100">Quick Capture</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">Notes, URLs, screenshots, voice references, and ideas land here first.</Dialog.Description>
            </div>
            <Dialog.Close className="grid size-9 place-items-center border border-cyan/15 hover:border-cyan/40">
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
              <input required name="title" placeholder="Memory title" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <select name="kind" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan">
                {kinds.map((kind) => <option key={kind}>{kind}</option>)}
              </select>
            </div>
            <textarea name="summary" placeholder="What happened? Paste a note, URL, or rough thought." className="h-28 w-full resize-none border border-cyan/15 bg-void p-3 outline-none focus:border-cyan" />
            <div className="grid gap-3 sm:grid-cols-4">
              <input name="date" type="date" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <input name="emotion" placeholder="emotion" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <input name="location" placeholder="location" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
              <input name="intensity" type="number" min="1" max="100" placeholder="intensity" className="h-11 border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
            </div>
            <input name="tags" placeholder="tags separated by commas" className="h-11 w-full border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                setFileNames(Array.from(event.dataTransfer.files).map((file) => file.name));
              }}
              className="flex min-h-20 cursor-pointer items-center justify-between gap-3 border border-dashed border-cyan/20 bg-void/80 p-4 text-sm text-slate-400 hover:border-cyan/45"
            >
              <span className="flex items-center gap-3"><Paperclip className="size-4 text-cyan" /> {fileNames.length ? fileNames.join(", ") : "Drop files or pick references"}</span>
              <input type="file" multiple className="hidden" onChange={(event) => setFileNames(Array.from(event.target.files ?? []).map((file) => file.name))} />
              <Mic className="size-4 text-cyan" />
            </label>
            <button className="inline-flex h-11 w-full items-center justify-center gap-2 border border-cyan/35 bg-cyan/10 text-cyan shadow-signal">
              <Save className="size-4" /> Capture {online ? "now" : "offline"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
