import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  meta?: string;
  children: ReactNode;
};

export function Panel({ title, meta, children }: PanelProps) {
  return (
    <section className="gsap-panel rounded-lg border border-cyan/15 bg-ink/72 p-[var(--memory-panel-pad)] shadow-2xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-slate-100">{title}</h2>
          {meta && <p className="mt-1 text-xs uppercase tracking-[.22em] text-cyan/70">{meta}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}
