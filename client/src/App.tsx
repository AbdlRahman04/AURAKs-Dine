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
import FeedbackManagementPage from "@/pages/admin/FeedbackManagementPage";
import MenuManagementPage from "@/pages/admin/MenuManagementPage";
import AnalyticsPage from "@/pages/admin/AnalyticsPage";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAdmin) {
      setLocation('/menu');
    }
  }, [isAdmin, setLocation]);

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/:rest*" component={LandingPage} />
        </>
      ) : (
        <>
          {/* Student Routes */}
          <Route path="/" component={MenuPage} />
          <Route path="/menu" component={MenuPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/orders" component={OrdersPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/feedback" component={FeedbackPage} />
          <Route path="/profile" component={ProfilePage} />
          
          {/* Admin Routes - with access control */}
          <Route path="/admin" component={() => <RequireAdmin><KitchenDisplayPage /></RequireAdmin>} />
          <Route path="/admin/menu" component={() => <RequireAdmin><MenuManagementPage /></RequireAdmin>} />
          <Route path="/admin/orders" component={() => <RequireAdmin><KitchenDisplayPage /></RequireAdmin>} />
          <Route path="/admin/feedback" component={() => <RequireAdmin><FeedbackManagementPage /></RequireAdmin>} />
          <Route path="/admin/analytics" component={() => <RequireAdmin><AnalyticsPage /></RequireAdmin>} />
          
          {/* Fallback to 404 - only for unmatched routes (must have at least one character after /) */}
          <Route path="/:rest+" component={NotFound} />
        </>
      )}
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
