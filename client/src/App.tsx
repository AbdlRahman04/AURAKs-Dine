import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense, useEffect, useRef } from "react";
import { apiUrl, queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AdminPageSkeleton } from "@/components/admin/AdminPageSkeleton";
import { StudentPageSkeleton } from "@/components/student/StudentPageSkeleton";
import { studentPageLoaders, type StudentPagePath } from "@/lib/studentRoutePrefetch";

const LandingPage = lazy(() => import("@/components/LandingPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage"));
const MenuPage = lazy(studentPageLoaders['/menu']);
const CheckoutPage = lazy(studentPageLoaders['/checkout']);
const OrdersPage = lazy(studentPageLoaders['/orders']);
const NotificationsPage = lazy(studentPageLoaders['/notifications']);
const FavoritesPage = lazy(studentPageLoaders['/favorites']);
const ProfilePage = lazy(studentPageLoaders['/profile']);
const FeedbackPage = lazy(studentPageLoaders['/feedback']);
const KitchenDisplayPage = lazy(() => import("@/pages/admin/KitchenDisplayPage"));
const AllOrdersPage = lazy(() => import("@/pages/admin/AllOrdersPage"));
const FeedbackManagementPage = lazy(() => import("@/pages/admin/FeedbackManagementPage"));
const MenuManagementPage = lazy(() => import("@/pages/admin/MenuManagementPage"));
const AnalyticsPage = lazy(() => import("@/pages/admin/AnalyticsPage"));
const MonitoringPage = lazy(() => import("@/pages/admin/MonitoringPage"));
const UserManagementPage = lazy(() => import("@/pages/admin/UserManagementPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageFallback() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const studentPath = (['/menu', '/checkout', '/orders', '/notifications', '/favorites', '/profile', '/feedback'] as const)
    .find((path) => location === path) as StudentPagePath | undefined;
  const loadingStudentPath = studentPath ?? (location === '/' && isAuthenticated ? '/menu' : undefined);

  if (loadingStudentPath) {
    return <StudentPageSkeleton path={loadingStudentPath} />;
  }

  if (location.startsWith('/admin')) {
    return (
      <div className="admin-shell flex min-h-screen bg-background">
        <aside className="admin-sidebar" aria-hidden="true">
          <div className="admin-sidebar-brand">
            <div className="skeleton-shimmer h-10 w-10 rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-28 rounded bg-muted" />
              <div className="skeleton-shimmer h-3 w-20 rounded bg-muted" />
            </div>
          </div>
          <div className="admin-sidebar-nav space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="skeleton-shimmer h-10 rounded-lg bg-muted/70" />
            ))}
          </div>
        </aside>
        <main className="admin-main min-w-0 flex-1">
          <AdminPageSkeleton label="admin page" />
        </main>
      </div>
    );
  }

  return (
    <div className="route-loading-screen min-h-screen flex items-center justify-center px-6" role="status" aria-label="Loading page" aria-busy="true">
      <div className="route-loading-card">
        <span className="route-loading-mark" aria-hidden="true">
          <span className="route-loading-spinner" />
        </span>
        <p className="route-loading-brand">QuickDineFlow</p>
        <p className="route-loading-copy">Getting things ready for you</p>
        <span className="sr-only">Loading page</span>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      setLocation('/menu');
    }
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading) {
    return <PageFallback />;
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

function HomePage() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MenuPage /> : <LandingPage />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={HomePage} />
      <Route path="/menu" component={MenuPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />

      {/* Protected student routes */}
      <Route path="/checkout" component={() => <RequireAuth><CheckoutPage /></RequireAuth>} />
      <Route path="/orders" component={() => <RequireAuth><OrdersPage /></RequireAuth>} />
      <Route path="/notifications" component={() => <RequireAuth><NotificationsPage /></RequireAuth>} />
      <Route path="/favorites" component={() => <RequireAuth><FavoritesPage /></RequireAuth>} />
      <Route path="/feedback" component={() => <RequireAuth><FeedbackPage /></RequireAuth>} />
      <Route path="/profile" component={() => <RequireAuth><ProfilePage /></RequireAuth>} />

      {/* Admin routes */}
      <Route path="/admin" component={() => <RequireAdmin><KitchenDisplayPage /></RequireAdmin>} />
      <Route path="/admin/menu" component={() => <RequireAdmin><MenuManagementPage /></RequireAdmin>} />
      <Route path="/admin/orders" component={() => <RequireAdmin><AllOrdersPage /></RequireAdmin>} />
      <Route path="/admin/feedback" component={() => <RequireAdmin><FeedbackManagementPage /></RequireAdmin>} />
      <Route path="/admin/users" component={() => <RequireAdmin><UserManagementPage /></RequireAdmin>} />
      <Route path="/admin/analytics" component={() => <RequireAdmin><AnalyticsPage /></RequireAdmin>} />
      <Route path="/admin/monitoring" component={() => <RequireAdmin><MonitoringPage /></RequireAdmin>} />

      <Route path="/:rest*">
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

const telemetryPages = new Set([
  "/", "/menu", "/login", "/register", "/checkout", "/orders", "/notifications", "/favorites",
  "/profile", "/feedback", "/forgot-password", "/reset-password", "/admin", "/admin/menu", "/admin/orders", "/admin/feedback",
  "/admin/users", "/admin/analytics", "/admin/monitoring",
]);

function ClientObservability() {
  const [location] = useLocation();
  const routeStartedAt = useRef<number | null>(null);

  useEffect(() => {
    const page = telemetryPages.has(location) ? location : undefined;
    if (page) {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      const durationMs = routeStartedAt.current === null
        ? navigation?.loadEventEnd || navigation?.domContentLoadedEventEnd || performance.now()
        : performance.now() - routeStartedAt.current;
      const payload = JSON.stringify({ kind: "page_load", page, durationMs: Math.max(0, durationMs) });
      void fetch(apiUrl("/api/observability/events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => undefined);
    }
    routeStartedAt.current = null;
  }, [location]);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      routeStartedAt.current = performance.now();
      return originalPushState.apply(window.history, args);
    };
    const onPopState = () => { routeStartedAt.current = performance.now(); };
    window.addEventListener('popstate', onPopState);
    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  useEffect(() => {
    const report = (event: "script_error" | "unhandled_rejection" | "resource_error") => {
      const page = telemetryPages.has(window.location.pathname) ? window.location.pathname : undefined;
      if (!page) return;
      void fetch(apiUrl("/api/observability/events"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "client_error", event, page }),
        keepalive: true,
      }).catch(() => undefined);
    };
    const onError = (event: ErrorEvent) => report(event.target instanceof HTMLElement ? "resource_error" : "script_error");
    const onRejection = () => report("unhandled_rejection");
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <ClientObservability />
              <Suspense fallback={<PageFallback />}>
                <Router />
              </Suspense>
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
