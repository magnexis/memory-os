import { motion } from "framer-motion";
import { Brain, Gauge, KeyRound, LogIn, Mail, Network, ShieldCheck, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemoryStore } from "../store/useMemoryStore";

const copy: Record<string, [string, string, LucideIcon]> = {
  "/auth/login": ["Resume Archive", "Sign in to reopen your neural map.", LogIn],
  "/auth/register": ["Create Identity", "Start a private memory universe.", Brain],
  "/auth/forgot-password": ["Recover Signal", "Request a secure reset transmission.", Mail],
  "/auth/reset-password": ["Reset Key", "Install a new access phrase.", KeyRound]
};

export function AuthPage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const notify = useMemoryStore((state) => state.notify);
  const [remember, setRemember] = useState(true);
  const [email, setEmail] = useState("demo@memoryos.local");
  const [password, setPassword] = useState("memoryos-demo");
  const [name, setName] = useState("Archive Operator");
  const [error, setError] = useState("");
  const [title, subtitle, Icon] = copy[pathname as keyof typeof copy] ?? copy["/auth/login"];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) return setError("Enter a valid email signal.");
    if (!pathname.includes("forgot") && password.length < 8) return setError("Access phrase must be at least 8 characters.");
    localStorage.setItem("memoryos.session", JSON.stringify({ email, name, remember, createdAt: new Date().toISOString() }));
    notify(pathname.includes("forgot") ? "Reset link generated for the account." : "Secure session established.");
    const onboarded = localStorage.getItem("memoryos.onboarding");
    navigate(pathname.includes("forgot") ? "/auth/reset-password" : onboarded ? "/memory-stream" : "/auth/onboarding");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-void px-5 text-slate-100">
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={submit}
        className="w-full max-w-md rounded-lg border border-cyan/15 bg-ink p-8 shadow-signal"
      >
        <div className="mb-8 flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-md border border-cyan/20 bg-cyan/10">
            <Icon className="size-6 text-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-medium">{title}</h1>
            <p className="text-sm text-slate-400">{subtitle}</p>
          </div>
        </div>
        {pathname === "/auth/register" && (
          <label className="mb-4 block text-sm">
            <span className="mb-2 block text-slate-400">Name</span>
            <input value={name} onChange={(event) => setName(event.target.value)} className="h-11 w-full rounded-md border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
          </label>
        )}
        <label className="mb-4 block text-sm">
          <span className="mb-2 block text-slate-400">Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
        </label>
        {!pathname.includes("forgot") && (
          <label className="mb-4 block text-sm">
            <span className="mb-2 block text-slate-400">Access phrase</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-cyan/15 bg-void px-3 outline-none focus:border-cyan" />
          </label>
        )}
        <button type="button" onClick={() => setRemember((value) => !value)} className="mb-5 flex items-center gap-3 text-sm text-slate-400">
          <span className={`grid size-5 place-items-center rounded border ${remember ? "border-cyan bg-cyan/20 text-cyan" : "border-cyan/20"}`}>
            {remember && <ShieldCheck className="size-3" />}
          </span>
          Remember this device
        </button>
        {error && <div className="mb-4 rounded-md border border-rose/30 bg-rose/10 px-3 py-2 text-sm text-rose">{error}</div>}
        <button className="h-12 w-full rounded-md border border-cyan/30 bg-cyan/10 text-cyan shadow-signal hover:bg-cyan/15">Continue</button>
        <div className="mt-6 flex justify-between text-xs text-slate-500">
          <Link to="/auth/login" className="hover:text-cyan">Login</Link>
          <Link to="/auth/register" className="hover:text-cyan">Register</Link>
          <Link to="/auth/forgot-password" className="hover:text-cyan">Forgot</Link>
        </div>
      </motion.form>
    </div>
  );
}

const onboardingSteps = [
  {
    icon: Gauge,
    title: "Choose operating density",
    body: "Balanced gives you roomy panels without crowding the graph. You can change this anytime in Settings."
  },
  {
    icon: Network,
    title: "Start with a spatial archive",
    body: "MemoryOS opens into live routes, searchable records, quick capture, smart links, and the Node Atlas."
  },
  {
    icon: Sparkles,
    title: "Tune notification timing",
    body: "System notifications now dismiss after three seconds by default. Adjust the timer from Settings."
  }
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const notify = useMemoryStore((state) => state.notify);
  const setDensityMode = useMemoryStore((state) => state.setDensityMode);
  const setToastDuration = useMemoryStore((state) => state.setToastDuration);
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const Icon = current.icon;

  const finish = () => {
    setDensityMode("balanced");
    setToastDuration(3000);
    localStorage.setItem("memoryos.onboarding", JSON.stringify({ completedAt: new Date().toISOString() }));
    notify("Onboarding complete. MemoryOS is ready.");
    navigate("/memory-stream");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-void px-5 text-slate-100">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl rounded-lg border border-cyan/15 bg-ink p-8 shadow-signal"
      >
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-[.34em] text-cyan">First Run</div>
            <h1 className="mt-2 text-3xl font-light">Configure your archive.</h1>
          </div>
          <div className="font-mono text-xs text-slate-500">{step + 1} / {onboardingSteps.length}</div>
        </div>
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="grid min-h-56 place-items-center rounded-lg border border-cyan/10 bg-cyan/5">
            <Icon className="size-20 text-cyan" />
          </div>
          <div>
            <h2 className="text-2xl font-light text-slate-100">{current.title}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">{current.body}</p>
            <div className="mt-8 grid grid-cols-3 gap-2">
              {onboardingSteps.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => setStep(index)}
                  className={`h-2 rounded-full ${index <= step ? "bg-cyan" : "bg-slate-800"}`}
                  aria-label={`Go to onboarding step ${index + 1}`}
                />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => step === 0 ? navigate("/auth/logout") : setStep((value) => value - 1)} className="h-11 rounded-md border border-cyan/15 px-4 text-sm text-slate-300 hover:border-cyan/40">
                {step === 0 ? "Back to sign in" : "Previous"}
              </button>
              <button onClick={() => step === onboardingSteps.length - 1 ? finish() : setStep((value) => value + 1)} className="h-11 rounded-md border border-cyan/30 bg-cyan/10 px-5 text-sm text-cyan shadow-signal hover:bg-cyan/15">
                {step === onboardingSteps.length - 1 ? "Enter MemoryOS" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export function LogoutPage() {
  const navigate = useNavigate();
  const notify = useMemoryStore((state) => state.notify);
  useEffect(() => {
    localStorage.removeItem("memoryos.session");
    notify("Session sealed and local token cleared.");
    const timer = window.setTimeout(() => navigate("/auth/login"), 700);
    return () => window.clearTimeout(timer);
  }, [navigate, notify]);
  return <AuthPage />;
}
