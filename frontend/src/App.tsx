import { Suspense, lazy, type ReactElement } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { Shell } from "./components/Shell";

const AuthPage = lazy(() => import("./pages/Auth").then((module) => ({ default: module.AuthPage })));
const LogoutPage = lazy(() => import("./pages/Auth").then((module) => ({ default: module.LogoutPage })));
const OnboardingPage = lazy(() => import("./pages/Auth").then((module) => ({ default: module.OnboardingPage })));
const Dashboard = lazy(() => import("./pages/Dashboard").then((module) => ({ default: module.Dashboard })));
const MemorySpace = lazy(() => import("./pages/MemorySpace").then((module) => ({ default: module.MemorySpace })));
const Timeline = lazy(() => import("./pages/Timeline").then((module) => ({ default: module.Timeline })));
const CollectionPage = lazy(() => import("./pages/CollectionPages").then((module) => ({ default: module.CollectionPage })));
const SettingsPage = lazy(() => import("./pages/CollectionPages").then((module) => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import("./pages/CollectionPages").then((module) => ({ default: module.ProfilePage })));
const MemoryStreamPage = lazy(() => import("./pages/OperationalPages").then((module) => ({ default: module.MemoryStreamPage })));
const SystemPage = lazy(() => import("./pages/OperationalPages").then((module) => ({ default: module.SystemPage })));
const InsightsPage = lazy(() => import("./pages/OperationalPages").then((module) => ({ default: module.InsightsPage })));
const SyncPage = lazy(() => import("./pages/OperationalPages").then((module) => ({ default: module.SyncPage })));
const DeveloperConsolePage = lazy(() => import("./pages/OperationalPages").then((module) => ({ default: module.DeveloperConsolePage })));

function RouteLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-void text-cyan">
      <div className="border border-cyan/20 bg-ink px-5 py-4 font-mono text-xs uppercase tracking-[.3em] shadow-signal">
        Loading MemoryOS
      </div>
    </div>
  );
}

function lazyRoute(element: ReactElement) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

function ProtectedShell() {
  const session = typeof window === "undefined" ? null : window.localStorage.getItem("memoryos.session");
  return session ? <Shell /> : <Navigate to="/auth/login" replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/memory-stream" replace /> },
  { path: "/auth/login", element: lazyRoute(<AuthPage />) },
  { path: "/auth/register", element: lazyRoute(<AuthPage />) },
  { path: "/auth/forgot-password", element: lazyRoute(<AuthPage />) },
  { path: "/auth/reset-password", element: lazyRoute(<AuthPage />) },
  { path: "/auth/onboarding", element: lazyRoute(<OnboardingPage />) },
  { path: "/auth/logout", element: lazyRoute(<LogoutPage />) },
  {
    element: <ProtectedShell />,
    children: [
      { path: "/dashboard", element: lazyRoute(<Dashboard />) },
      { path: "/memory-stream", element: lazyRoute(<MemoryStreamPage />) },
      { path: "/memory-space", element: lazyRoute(<MemorySpace />) },
      { path: "/nodes", element: lazyRoute(<MemorySpace />) },
      { path: "/timeline", element: lazyRoute(<Timeline />) },
      { path: "/projects", element: lazyRoute(<CollectionPage route="projects" />) },
      { path: "/archive", element: lazyRoute(<CollectionPage route="archive" />) },
      { path: "/dreamspace", element: lazyRoute(<CollectionPage route="dreamspace" />) },
      { path: "/relationships", element: lazyRoute(<CollectionPage route="relationships" />) },
      { path: "/locations", element: lazyRoute(<CollectionPage route="locations" />) },
      { path: "/music", element: lazyRoute(<CollectionPage route="music" />) },
      { path: "/ideas", element: lazyRoute(<CollectionPage route="ideas" />) },
      { path: "/media", element: lazyRoute(<CollectionPage route="media" />) },
      { path: "/settings", element: lazyRoute(<SettingsPage />) },
      { path: "/profile", element: lazyRoute(<ProfilePage />) },
      { path: "/developer-console", element: lazyRoute(<DeveloperConsolePage />) },
      { path: "/system", element: lazyRoute(<SystemPage />) },
      { path: "/insights", element: lazyRoute(<InsightsPage />) },
      { path: "/sync", element: lazyRoute(<SyncPage />) }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
