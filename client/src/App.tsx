import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/LandingPage";
import MenuPage from "@/pages/MenuPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import ProfilePage from "@/pages/ProfilePage";
import FeedbackPage from "@/pages/FeedbackPage";
import KitchenDisplayPage from "@/pages/admin/KitchenDisplayPage";
import FeedbackManagementPage from "@/pages/admin/FeedbackManagementPage";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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
          
          {/* Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" component={KitchenDisplayPage} />
              <Route path="/admin/menu" component={() => <div className="p-8"><h1 className="text-2xl font-bold">Menu Management - Coming Soon</h1><p className="text-muted-foreground mt-2">Full menu CRUD interface will be available in the next phase.</p></div>} />
              <Route path="/admin/orders" component={KitchenDisplayPage} />
              <Route path="/admin/feedback" component={FeedbackManagementPage} />
              <Route path="/admin/analytics" component={() => <div className="p-8"><h1 className="text-2xl font-bold">Analytics Dashboard - Coming Soon</h1><p className="text-muted-foreground mt-2">Charts, reports, and CSV exports will be available in the next phase.</p></div>} />
            </>
          )}
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
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
