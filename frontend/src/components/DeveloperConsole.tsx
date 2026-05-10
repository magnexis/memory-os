import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import {
  Activity,
  Braces,
  Check,
  Clipboard,
  Download,
  KeyRound,
  Play,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Webhook,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMemoryStore } from "../store/useMemoryStore";

type ApiScope = "memories:read" | "memories:write" | "media:write" | "search:read" | "webhooks:write";
type ApiStatus = "active" | "restricted" | "revoked";
type WebhookEvent = "memory.created" | "memory.updated" | "media.uploaded" | "smart_link.created" | "project.updated";

type DeveloperSettings = {
  apiKeys: Array<{ id: string; label: string; key: string; createdAt: string; status: ApiStatus; scopes: ApiScope[]; lastUsed?: string }>;
  webhookUrl: string;
  webhookSecret: string;
  webhookEvents: WebhookEvent[];
  environment: "development" | "staging" | "production";
  baseUrl: string;
  deliveries: Array<{ id: string; event: WebhookEvent; status: number; deliveredAt: string; latency: number }>;
};

const storageKey = "memoryos.developer";
const scopes: ApiScope[] = ["memories:read", "memories:write", "media:write", "search:read", "webhooks:write"];
const webhookEvents: WebhookEvent[] = ["memory.created", "memory.updated", "media.uploaded", "smart_link.created", "project.updated"];
const endpoints = [
  { method: "GET", path: "/api/health", scope: "public", body: "" },
  { method: "GET", path: "/api/v1/status", scope: "api", body: "" },
  { method: "GET", path: "/api/v1/memories", scope: "memories:read", body: "" },
  { method: "GET", path: "/api/v1/graph", scope: "memories:read", body: "" },
  { method: "GET", path: "/api/v1/search?q=summer", scope: "search:read", body: "" },
  { method: "POST", path: "/api/media", scope: "media:write", body: "FormData upload" }
];

function randomToken(prefix: string, bytes = 24) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  const token = Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${token}`;
}

function readDeveloperSettings(): DeveloperSettings {
  const fallback: DeveloperSettings = {
    apiKeys: [],
    webhookUrl: "https://example.com/memoryos/webhook",
    webhookSecret: randomToken("whsec", 18),
    webhookEvents: ["memory.created", "media.uploaded"],
    environment: "development",
    baseUrl: "http://localhost:4400",
    deliveries: []
  };

  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return fallback;

  try {
    const parsed = { ...fallback, ...JSON.parse(stored) as Partial<DeveloperSettings> };
    return {
      ...parsed,
      apiKeys: parsed.apiKeys.map((key) => ({
        ...key,
        status: key.status ?? "active",
        scopes: key.scopes?.length ? key.scopes : ["memories:read", "search:read"]
      }))
    };
  } catch {
    return fallback;
  }
}

function persist(settings: DeveloperSettings) {
  window.localStorage.setItem(storageKey, JSON.stringify(settings));
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function maskKey(key: string) {
  const [prefix] = key.split("_");
  return `${prefix}_${"*".repeat(12)}${key.slice(-8)}`;
}

export function DeveloperConsole() {
  const notify = useMemoryStore((state) => state.notify);
  const records = useMemoryStore((state) => state.records);
  const links = useMemoryStore((state) => state.links);
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<DeveloperSettings>(() => readDeveloperSettings());
  const [label, setLabel] = useState("Local integration key");
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>(["memories:read", "search:read"]);
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [lastResponse, setLastResponse] = useState("No request run yet.");

  useEffect(() => {
    persist(settings);
  }, [settings]);

  const latestKey = settings.apiKeys.find((key) => key.status === "active")?.key ?? "generate_an_api_key_first";
  const curlSnippet = useMemo(() => {
    const body = selectedEndpoint.body && selectedEndpoint.body !== "FormData upload"
      ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${selectedEndpoint.body.replace(/\n/g, "")}'`
      : "";
    return `curl -X ${selectedEndpoint.method} "${settings.baseUrl}${selectedEndpoint.path}" \\\n  -H "Authorization: Bearer ${latestKey}"${body}`;
  }, [latestKey, selectedEndpoint, settings.baseUrl]);
  const fetchSnippet = useMemo(() => `await fetch("${settings.baseUrl}${selectedEndpoint.path}", {
  method: "${selectedEndpoint.method}",
  headers: {
    Authorization: "Bearer ${latestKey}"${selectedEndpoint.body && selectedEndpoint.body !== "FormData upload" ? ',\n    "Content-Type": "application/json"' : ""}
  }${selectedEndpoint.body && selectedEndpoint.body !== "FormData upload" ? `,\n  body: JSON.stringify(${selectedEndpoint.body})` : ""}
});`, [latestKey, selectedEndpoint, settings.baseUrl]);
  const envText = useMemo(() => [
    `MEMORYOS_ENV=${settings.environment}`,
    `VITE_API_URL=${settings.baseUrl}/api`,
    `VITE_REALTIME_URL=${settings.baseUrl.replace(/^http/, "ws")}/realtime`,
    `MEMORYOS_API_KEY=${latestKey}`,
    `MEMORYOS_WEBHOOK_URL=${settings.webhookUrl}`,
    `MEMORYOS_WEBHOOK_SECRET=${settings.webhookSecret}`,
    `MEMORYOS_WEBHOOK_EVENTS=${settings.webhookEvents.join(",")}`
  ].join("\n"), [latestKey, settings]);

  const updateSettings = (next: DeveloperSettings, message?: string) => {
    setSettings(next);
    persist(next);
    if (message) notify(message);
  };

  const copy = async (value: string, message: string) => {
    try {
      await writeClipboard(value);
      notify(message);
    } catch {
      notify("Clipboard blocked by the browser.");
    }
  };

  const generateKey = () => {
    const key = {
      id: `key-${Date.now()}`,
      label: label.trim() || "MemoryOS API key",
      key: randomToken(settings.environment === "production" ? "mos_live" : "mos_test"),
      createdAt: new Date().toISOString(),
      status: "active" as ApiStatus,
      scopes: selectedScopes
    };
    updateSettings({ ...settings, apiKeys: [key, ...settings.apiKeys].slice(0, 8) }, "API key generated.");
    fetch(`${settings.baseUrl}/api/developer/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: key.label, scopes: key.scopes, environment: settings.environment })
    })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("MemoryOS API unavailable")))
      .then((remote: { id: string; key: string; label: string; scopes: ApiScope[]; status: ApiStatus; createdAt: string }) => {
        updateSettings({
          ...settings,
          apiKeys: [{ id: remote.id, label: remote.label, key: remote.key, createdAt: remote.createdAt, status: remote.status, scopes: remote.scopes }, ...settings.apiKeys].slice(0, 8)
        }, "Backend MemoryOS API key generated.");
      })
      .catch(() => notify("Local API key generated. Start the backend to register it with MemoryOS API."));
  };

  const toggleScope = (scope: ApiScope) => {
    setSelectedScopes((current) => current.includes(scope) ? current.filter((item) => item !== scope) : [...current, scope]);
  };

  const toggleEvent = (event: WebhookEvent) => {
    const webhookEvents = settings.webhookEvents.includes(event)
      ? settings.webhookEvents.filter((item) => item !== event)
      : [...settings.webhookEvents, event];
    updateSettings({ ...settings, webhookEvents });
  };

  const simulateDelivery = () => {
    const event = settings.webhookEvents[0] ?? "memory.created";
    const delivery = {
      id: `del-${Date.now()}`,
      event,
      status: settings.webhookUrl.startsWith("https://") ? 200 : 422,
      deliveredAt: new Date().toISOString(),
      latency: 80 + Math.round(Math.random() * 220)
    };
    updateSettings({ ...settings, deliveries: [delivery, ...settings.deliveries].slice(0, 6) }, `Webhook test ${delivery.status === 200 ? "delivered" : "blocked"}.`);
  };

  const runEndpoint = async () => {
    if (selectedEndpoint.path === "/api/health" || selectedEndpoint.path.startsWith("/api/v1")) {
      try {
        const response = await fetch(`${settings.baseUrl}${selectedEndpoint.path}`, selectedEndpoint.path.startsWith("/api/v1")
          ? { headers: { Authorization: `Bearer ${latestKey}` } }
          : undefined);
        setLastResponse(JSON.stringify(await response.json(), null, 2));
      } catch {
        setLastResponse("Request failed. Start the backend with npm run dev and try again.");
      }
      return;
    }
    setLastResponse(JSON.stringify({
      simulated: true,
      method: selectedEndpoint.method,
      path: selectedEndpoint.path,
      requiredScope: selectedEndpoint.scope,
      recordsVisible: records.length,
      linksVisible: links.length
    }, null, 2));
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-cyan/15 bg-ink px-2.5 text-xs text-slate-300 hover:border-cyan/40 hover:text-cyan" aria-label="Open developer console">
          <Braces className="size-4" />
          <span className="hidden xl:inline">Developers</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/72" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[min(96vw,1040px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-cyan/25 bg-ink p-4 shadow-signal md:p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Dialog.Title className="text-2xl font-light text-slate-100">Developer Console</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Manage MemoryOS credentials, webhooks, environment blocks, and API test calls.
              </Dialog.Description>
            </div>
            <Dialog.Close className="grid size-9 shrink-0 place-items-center rounded-md border border-cyan/15 hover:border-cyan/40">
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-4">
            <Metric label="API keys" value={String(settings.apiKeys.filter((key) => key.status !== "revoked").length)} />
            <Metric label="Webhook events" value={String(settings.webhookEvents.length)} />
            <Metric label="Env" value={settings.environment} />
            <Metric label="Deliveries" value={String(settings.deliveries.length)} />
          </div>

          <Tabs.Root defaultValue="credentials">
            <Tabs.List className="mb-4 flex flex-wrap border border-cyan/15 bg-void p-1">
              {[
                ["credentials", "Credentials", KeyRound],
                ["webhooks", "Webhooks", Webhook],
                ["environment", "Environment", ShieldCheck],
                ["explorer", "API Explorer", Activity]
              ].map(([value, label, Icon]) => {
                const TabIcon = Icon as typeof KeyRound;
                return (
                  <Tabs.Trigger key={String(value)} value={String(value)} className="inline-flex h-10 items-center gap-2 px-4 text-sm text-slate-400 data-[state=active]:bg-cyan/10 data-[state=active]:text-cyan">
                    <TabIcon className="size-4" /> {String(label)}
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>

            <Tabs.Content value="credentials">
              <div className="grid gap-4 xl:grid-cols-[.9fr_1.1fr]">
                <section className="border border-cyan/15 bg-void/70 p-4">
                  <div className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-cyan">Generate key</div>
                  <input value={label} onChange={(event) => setLabel(event.target.value)} className="mb-3 h-11 w-full border border-cyan/15 bg-ink px-3 text-sm outline-none focus:border-cyan" />
                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    {scopes.map((scope) => (
                      <button key={scope} onClick={() => toggleScope(scope)} className={`flex h-10 items-center justify-between border px-3 text-xs ${selectedScopes.includes(scope) ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-400"}`}>
                        {scope}
                        {selectedScopes.includes(scope) && <Check className="size-3" />}
                      </button>
                    ))}
                  </div>
                  <button onClick={generateKey} className="inline-flex h-11 w-full items-center justify-center gap-2 border border-cyan/30 bg-cyan/10 px-4 text-cyan">
                    <Plus className="size-4" /> Generate API key
                  </button>
                </section>

                <section className="space-y-2">
                  {settings.apiKeys.length === 0 && <div className="border border-dashed border-cyan/15 p-4 text-sm text-slate-500">No API keys generated yet.</div>}
                  {settings.apiKeys.map((item) => (
                    <div key={item.id} className="border border-cyan/10 bg-void/70 p-3">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-slate-100">{item.label}</div>
                          <div className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()} / {item.status}</div>
                        </div>
                        <select
                          value={item.status}
                          onChange={(event) => updateSettings({ ...settings, apiKeys: settings.apiKeys.map((key) => key.id === item.id ? { ...key, status: event.target.value as ApiStatus } : key) }, "API key status updated.")}
                          className="h-9 border border-cyan/15 bg-ink px-2 text-xs text-slate-300"
                        >
                          <option value="active">active</option>
                          <option value="restricted">restricted</option>
                          <option value="revoked">revoked</option>
                        </select>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                        <code className="min-w-0 flex-1 truncate border border-cyan/10 bg-ink px-3 py-2 text-xs text-cyan">{maskKey(item.key)}</code>
                        <button onClick={() => copy(item.key, "API key copied.")} className="grid size-9 place-items-center border border-cyan/15 hover:border-cyan/40" aria-label={`Copy ${item.label}`}><Clipboard className="size-4 text-cyan" /></button>
                        <button onClick={() => updateSettings({ ...settings, apiKeys: settings.apiKeys.filter((key) => key.id !== item.id) }, "API key deleted.")} className="grid size-9 place-items-center border border-rose/20 text-rose hover:border-rose/50" aria-label={`Delete ${item.label}`}><Trash2 className="size-4" /></button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.scopes.map((scope) => <span key={scope} className="border border-cyan/10 bg-cyan/5 px-2 py-1 text-[11px] text-cyan/80">{scope}</span>)}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </Tabs.Content>

            <Tabs.Content value="webhooks">
              <div className="grid gap-4 xl:grid-cols-[.95fr_1.05fr]">
                <section className="border border-cyan/15 bg-void/70 p-4">
                  <div className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-cyan">Endpoint</div>
                  <label className="mb-3 block">
                    <span className="mb-2 block text-sm text-slate-400">URL</span>
                    <input value={settings.webhookUrl} onChange={(event) => updateSettings({ ...settings, webhookUrl: event.target.value })} className="h-11 w-full border border-cyan/15 bg-ink px-3 text-sm outline-none focus:border-cyan" />
                  </label>
                  <label className="mb-3 block">
                    <span className="mb-2 block text-sm text-slate-400">Signing secret</span>
                    <div className="flex gap-2">
                      <code className="min-w-0 flex-1 truncate border border-cyan/10 bg-ink px-3 py-3 text-xs text-cyan">{settings.webhookSecret}</code>
                      <button onClick={() => updateSettings({ ...settings, webhookSecret: randomToken("whsec", 18) }, "Webhook signing secret rotated.")} className="grid size-11 place-items-center border border-cyan/15 hover:border-cyan/40" aria-label="Rotate webhook secret"><RotateCcw className="size-4 text-cyan" /></button>
                    </div>
                  </label>
                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    {webhookEvents.map((event) => (
                      <button key={event} onClick={() => toggleEvent(event)} className={`flex h-10 items-center justify-between border px-3 text-xs ${settings.webhookEvents.includes(event) ? "border-cyan/40 bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-400"}`}>
                        {event}
                        {settings.webhookEvents.includes(event) && <Check className="size-3" />}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button onClick={() => copy(settings.webhookSecret, "Webhook secret copied.")} className="h-10 border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40">Copy secret</button>
                    <button onClick={simulateDelivery} className="inline-flex h-10 items-center justify-center gap-2 border border-cyan/30 bg-cyan/10 text-sm text-cyan"><Play className="size-4" /> Test</button>
                    <button onClick={() => copy(JSON.stringify({ event: settings.webhookEvents[0] ?? "memory.created", deliveredAt: new Date().toISOString(), signature: "sha256=<hmac>", data: { id: "mem_sample", title: "Sample memory" } }, null, 2), "Webhook sample copied.")} className="h-10 border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40">Copy sample</button>
                  </div>
                </section>

                <section className="border border-cyan/15 bg-void/70 p-4">
                  <div className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-cyan">Delivery log</div>
                  <div className="space-y-2">
                    {settings.deliveries.length === 0 && <div className="border border-dashed border-cyan/15 p-4 text-sm text-slate-500">No test deliveries yet.</div>}
                    {settings.deliveries.map((delivery) => (
                      <div key={delivery.id} className="grid grid-cols-[1fr_auto_auto] gap-3 border border-cyan/10 bg-ink p-3 text-sm">
                        <span className="text-slate-200">{delivery.event}</span>
                        <span className={delivery.status === 200 ? "text-cyan" : "text-rose"}>{delivery.status}</span>
                        <span className="text-slate-500">{delivery.latency}ms</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </Tabs.Content>

            <Tabs.Content value="environment">
              <section className="border border-cyan/15 bg-void/70 p-4">
                <div className="mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
                  <input value={settings.baseUrl} onChange={(event) => updateSettings({ ...settings, baseUrl: event.target.value })} className="h-10 border border-cyan/15 bg-ink px-3 text-sm text-slate-200 outline-none" />
                  <select value={settings.environment} onChange={(event) => updateSettings({ ...settings, environment: event.target.value as DeveloperSettings["environment"] }, "Environment profile updated.")} className="h-10 border border-cyan/15 bg-ink px-3 text-sm text-slate-200 outline-none">
                    <option value="development">development</option>
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                </div>
                <pre className="max-h-64 overflow-auto border border-cyan/10 bg-ink p-4 text-xs leading-6 text-slate-300">{envText}</pre>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button onClick={() => copy(envText, ".env block copied.")} className="inline-flex h-10 items-center justify-center gap-2 border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40"><Clipboard className="size-4" /> Copy .env</button>
                  <button onClick={() => downloadFile(".env.local", `${envText}\n`)} className="inline-flex h-10 items-center justify-center gap-2 border border-cyan/30 bg-cyan/10 text-sm text-cyan"><Download className="size-4" /> Download .env.local</button>
                </div>
              </section>
            </Tabs.Content>

            <Tabs.Content value="explorer">
              <div className="grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
                <section className="border border-cyan/15 bg-void/70 p-4">
                  <div className="mb-4 font-mono text-xs uppercase tracking-[.22em] text-cyan">Request builder</div>
                  <div className="space-y-2">
                    {endpoints.map((endpoint) => (
                      <button key={`${endpoint.method}-${endpoint.path}`} onClick={() => setSelectedEndpoint(endpoint)} className={`flex w-full items-center justify-between border p-3 text-left text-sm ${selectedEndpoint.path === endpoint.path && selectedEndpoint.method === endpoint.method ? "border-cyan/45 bg-cyan/10 text-cyan" : "border-cyan/10 text-slate-300"}`}>
                        <span><span className="font-mono text-xs">{endpoint.method}</span> {endpoint.path}</span>
                        <span className="text-xs text-slate-500">{endpoint.scope}</span>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="border border-cyan/15 bg-void/70 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-xs uppercase tracking-[.22em] text-cyan">{selectedEndpoint.method} {selectedEndpoint.path}</div>
                    <button onClick={runEndpoint} className="inline-flex h-9 items-center gap-2 border border-cyan/30 bg-cyan/10 px-3 text-sm text-cyan"><Play className="size-4" /> Run</button>
                  </div>
                  <pre className="mb-3 max-h-40 overflow-auto border border-cyan/10 bg-ink p-3 text-xs leading-5 text-slate-300">{curlSnippet}</pre>
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <button onClick={() => copy(curlSnippet, "cURL copied.")} className="h-10 border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40">Copy cURL</button>
                    <button onClick={() => copy(fetchSnippet, "Fetch snippet copied.")} className="h-10 border border-cyan/15 text-sm text-slate-300 hover:border-cyan/40">Copy fetch</button>
                  </div>
                  <pre className="max-h-48 overflow-auto border border-cyan/10 bg-ink p-3 text-xs leading-5 text-slate-300">{lastResponse}</pre>
                </section>
              </div>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-cyan/10 bg-void/70 p-3">
      <div className="font-mono text-[10px] uppercase tracking-[.2em] text-slate-500">{label}</div>
      <div className="mt-2 truncate text-lg text-cyan">{value}</div>
    </div>
  );
}
