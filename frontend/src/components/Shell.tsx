import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tooltip from "@radix-ui/react-tooltip";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Brain,
  Braces,
  CircleUserRound,
  Gauge,
  LogOut,
  Menu,
  Orbit,
  Search,
  Server,
  Settings,
  Sparkles,
  Wifi,
  X
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { memories } from "../data/memoryData";
import { useMemoryStore } from "../store/useMemoryStore";
import { useRealtime } from "../hooks/useRealtime";
import { AmbientField } from "./AmbientField";
import { DeveloperConsole } from "./DeveloperConsole";
import { QuickCapture } from "./QuickCapture";
import { SyncStatus } from "./SyncStatus";

const navItems = [
  { to: "/memory-stream", label: "Memory Stream", icon: Gauge },
  { to: "/archive", label: "Archive", icon: Archive },
  { to: "/timeline", label: "Timeline", icon: Sparkles },
  { to: "/nodes", label: "Nodes", icon: Orbit },
  { to: "/developer-console", label: "Developer Console", icon: Braces },
  { to: "/system", label: "System", icon: Server },
  { to: "/insights", label: "Insights", icon: Brain },
  { to: "/sync", label: "Sync", icon: Wifi },
  { to: "/profile", label: "Profile", icon: CircleUserRound },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  const query = useMemoryStore((state) => state.query);
  const setQuery = useMemoryStore((state) => state.setQuery);
  const setSelected = useMemoryStore((state) => state.setSelected);
  const toasts = useMemoryStore((state) => state.toasts);
  const dismiss = useMemoryStore((state) => state.dismiss);
  const notify = useMemoryStore((state) => state.notify);
  const toastDuration = useMemoryStore((state) => state.toastDuration);
  const ambient = useMemoryStore((state) => state.ambient);
  const animation = useMemoryStore((state) => state.animation);
  const glow = useMemoryStore((state) => state.glow);
  const densityMode = useMemoryStore((state) => state.densityMode);
  const navigate = useNavigate();
  const status = useRealtime();
  const fuse = useMemo(() => new Fuse(memories, { keys: ["title", "tags", "summary", "sector", "emotion"], threshold: 0.32 }), []);
  const results = query ? fuse.search(query).slice(0, 5).map((result) => result.item) : [];
  const ambientLevel = ambient / 100;
  const animationLevel = animation / 100;
  const glowLevel = glow / 100;
  const densityTokens = {
    compact: {
      header: "4rem",
      nav: "2.25rem",
      sidebar: "14rem",
      collapsedSidebar: "4.25rem",
      pageMax: "76rem",
      panel: "0.875rem",
      page: "1rem",
      pageLg: "1.35rem",
      node: "13rem",
      nodePad: "0.75rem"
    },
    balanced: {
      header: "4.75rem",
      nav: "2.75rem",
      sidebar: "18rem",
      collapsedSidebar: "4.75rem",
      pageMax: "92rem",
      panel: "1.25rem",
      page: "1.25rem",
      pageLg: "2rem",
      node: "16rem",
      nodePad: "1rem"
    },
    cinematic: {
      header: "5.5rem",
      nav: "3rem",
      sidebar: "19rem",
      collapsedSidebar: "5rem",
      pageMax: "104rem",
      panel: "1.5rem",
      page: "1.5rem",
      pageLg: "2.5rem",
      node: "18rem",
      nodePad: "1.25rem"
    }
  }[densityMode];
  const visualStyle = {
    "--memory-ambient": ambientLevel,
    "--memory-animation": animationLevel,
    "--memory-glow": glowLevel,
    "--memory-glow-px": `${Math.round(10 + glow * 0.34)}px`,
    "--memory-glow-inset-px": `${Math.round(3 + glow * 0.1)}px`,
    "--memory-bg-cyan-alpha": 0.035 + ambientLevel * 0.12,
    "--memory-bg-gold-alpha": 0.025 + glowLevel * 0.08,
    "--memory-grid-alpha": 0.025 + ambientLevel * 0.08,
    "--memory-grid-opacity": 0.18 + ambientLevel * 0.82,
    "--memory-grid-size": `${Math.round(68 - ambientLevel * 28)}px`,
    "--memory-line-alpha": 0.008 + ambientLevel * 0.035,
    "--memory-scan-opacity": 0.08 + ambientLevel * 0.28,
    "--memory-field-opacity": 0.16 + ambientLevel * 0.84,
    "--memory-shadow-alpha": 0.08 + glowLevel * 0.32,
    "--memory-shadow-inset-alpha": 0.02 + glowLevel * 0.08,
    "--memory-radar-duration": `${10 - animationLevel * 5.5}s`,
    "--memory-radar-opacity": 0.24 + glowLevel * 0.58,
    "--memory-radar-shadow-alpha": 0.1 + glowLevel * 0.32,
    "--memory-edge-duration": `${3.8 - animationLevel * 2.1}s`,
    "--memory-flow-border-alpha": 0.08 + glowLevel * 0.24,
    "--memory-flow-shadow-alpha": 0.04 + glowLevel * 0.14,
    "--memory-transition-duration": `${90 + animationLevel * 180}ms`,
    "--memory-header-h": densityTokens.header,
    "--memory-nav-row": densityTokens.nav,
    "--memory-sidebar-w": densityTokens.sidebar,
    "--memory-sidebar-collapsed-w": densityTokens.collapsedSidebar,
    "--memory-page-max-w": densityTokens.pageMax,
    "--memory-panel-pad": densityTokens.panel,
    "--memory-page-pad": densityTokens.page,
    "--memory-page-pad-lg": densityTokens.pageLg,
    "--memory-node-w": densityTokens.node,
    "--memory-node-pad": densityTokens.nodePad
  } as CSSProperties & Record<string, string | number>;

  const activateResult = (id: string) => {
    setSelected(id);
    setQuery("");
    navigate("/memory-space");
    notify("Memory focus transferred to the spatial map.");
  };

  useEffect(() => {
    if (toastDuration <= 0) return;
    const timers = toasts.map((toast) => window.setTimeout(() => dismiss(toast.id), toastDuration));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [dismiss, toastDuration, toasts]);

  return (
    <div className={`memory-shell density-${densityMode} relative h-screen overflow-hidden bg-void text-slate-100`} style={visualStyle}>
      <AmbientField />
      <div className="relative z-10 flex h-full">
        <aside
          className={`hidden border-r border-cyan/10 bg-void/80 backdrop-blur-none md:flex ${
            collapsed ? "w-[var(--memory-sidebar-collapsed-w)]" : "w-[var(--memory-sidebar-w)]"
          } flex-col transition-[width] duration-300`}
        >
          <div className="flex h-[var(--memory-header-h)] items-center gap-3 border-b border-cyan/10 px-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-md border border-cyan/25 bg-ink shadow-signal">
              <Brain className="size-5 text-cyan" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate font-mono text-xs uppercase tracking-[.28em] text-cyan">MemoryOS</div>
                <div className="text-xs text-slate-400">Neural archive online</div>
              </div>
            )}
          </div>
          <nav className="flex-1 overflow-y-auto px-2.5 py-3">
            {navItems.map((item) => (
              <Tooltip.Root key={item.to}>
                <Tooltip.Trigger asChild>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `mb-1 flex h-[var(--memory-nav-row)] items-center gap-3 rounded-md border px-3 text-sm transition ${
                        isActive
                          ? "border-cyan/40 bg-cyan/10 text-cyan shadow-signal"
                          : "border-transparent text-slate-400 hover:border-cyan/15 hover:bg-cyan/5 hover:text-slate-100"
                      }`
                    }
                  >
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </Tooltip.Trigger>
                {collapsed && <Tooltip.Content side="right">{item.label}</Tooltip.Content>}
              </Tooltip.Root>
            ))}
          </nav>
          <button
            className="m-3 flex h-[var(--memory-nav-row)] items-center justify-center gap-2 rounded-md border border-cyan/10 text-slate-300 hover:border-cyan/30 hover:text-cyan"
            onClick={() => setCollapsed((value) => !value)}
          >
            <Menu className="size-4" />
            {!collapsed && "Collapse"}
          </button>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[var(--memory-header-h)] min-w-0 items-center gap-2 border-b border-cyan/10 bg-void/70 px-3 backdrop-blur-none md:px-5">
            <div className="relative min-w-0 flex-1 xl:max-w-2xl">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search memories, tags, dates, places, emotions..."
                className="h-10 w-full rounded-md border border-cyan/15 bg-ink/80 pl-10 pr-3 text-sm text-slate-100 outline-none transition focus:border-cyan/50"
              />
              {results.length > 0 && (
                <div className="absolute top-12 z-30 w-full rounded-lg border border-cyan/20 bg-ink p-2 shadow-2xl">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => activateResult(item.id)}
                      className="flex w-full items-center justify-between border border-transparent p-3 text-left hover:border-cyan/20 hover:bg-cyan/5"
                    >
                      <span>
                        <span className="block text-sm text-slate-100">{item.title}</span>
                        <span className="text-xs text-slate-500">{item.tags.join(" / ")}</span>
                      </span>
                      <span className="font-mono text-xs uppercase text-cyan">{item.kind}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden h-10 shrink-0 items-center gap-2 rounded-md border border-cyan/15 bg-ink px-2.5 text-xs text-slate-400 2xl:flex">
              <span className={`size-2 ${status === "online" ? "bg-cyan" : "bg-rose"}`} />
              {status}
            </div>
            <SyncStatus />
            <DeveloperConsole />
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="grid size-10 shrink-0 place-items-center rounded-md border border-cyan/15 bg-ink text-slate-300 hover:border-cyan/40 hover:text-cyan">
                  <CircleUserRound className="size-5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="z-40 min-w-48 border border-cyan/20 bg-ink p-2 text-sm text-slate-200 shadow-2xl">
                <DropdownMenu.Item onClick={() => navigate("/profile")} className="cursor-pointer px-3 py-2 outline-none hover:bg-cyan/10">
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => navigate("/settings")} className="cursor-pointer px-3 py-2 outline-none hover:bg-cyan/10">
                  Settings
                </DropdownMenu.Item>
                <DropdownMenu.Item onClick={() => navigate("/auth/logout")} className="flex cursor-pointer items-center gap-2 px-3 py-2 outline-none hover:bg-cyan/10">
                  <LogOut className="size-4" /> Logout
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <QuickCapture />
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => dismiss(toast.id)}
            className="fixed bottom-24 right-5 z-50 flex max-w-sm items-center gap-3 overflow-hidden rounded-lg border border-cyan/20 bg-ink px-4 py-3 text-left text-sm text-slate-200 shadow-signal"
          >
            <span className="size-2 bg-cyan" />
            {toast.message}
            <X className="ml-2 size-4 text-slate-500" />
            {toastDuration > 0 && (
              <motion.span
                className="absolute bottom-0 left-0 h-px bg-cyan/70"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: toastDuration / 1000, ease: "linear" }}
              />
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
