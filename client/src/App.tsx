import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import MenuPage from "@/pages/MenuPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ProfilePage from "@/pages/ProfilePage";
import FeedbackPage from "@/pages/FeedbackPage";
import KitchenDisplayPage from "@/pages/admin/KitchenDisplayPage";
import AllOrdersPage from "@/pages/admin/AllOrdersPage";
import FeedbackManagementPage from "@/pages/admin/FeedbackManagementPage";
import MenuManagementPage from "@/pages/admin/MenuManagementPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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

      {/* Protected student routes */}
      <Route path="/checkout" component={() => <RequireAuth><CheckoutPage /></RequireAuth>} />
      <Route path="/orders" component={() => <RequireAuth><OrdersPage /></RequireAuth>} />
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

      <Route path="/:rest*">
        {() => <NotFound />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </CartProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
