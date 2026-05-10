import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { useMemoryStore } from "../store/useMemoryStore";

type ActionButtonProps = {
  icon: ComponentType<LucideProps>;
  label: string;
  action?: string;
  onClick?: () => void;
};

export function ActionButton({ icon: Icon, label, action, onClick }: ActionButtonProps) {
  const notify = useMemoryStore((state) => state.notify);
  return (
    <button
      onClick={() => onClick ? onClick() : notify(action ?? `${label} activated.`)}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-cyan/15 bg-cyan/5 px-3 text-xs text-slate-200 transition hover:border-cyan/50 hover:text-cyan"
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}
