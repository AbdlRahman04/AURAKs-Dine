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
import { CartProvider } from "@/contexts/CartContext";

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
          <Route path="/profile" component={ProfilePage} />
          
          {/* Admin Routes */}
          {isAdmin && (
            <>
              <Route path="/admin" component={() => <div>Admin Kitchen Display (Coming in Phase 2)</div>} />
              <Route path="/admin/menu" component={() => <div>Admin Menu Management (Coming in Phase 2)</div>} />
              <Route path="/admin/orders" component={() => <div>Admin Orders (Coming in Phase 2)</div>} />
              <Route path="/admin/analytics" component={() => <div>Admin Analytics (Coming in Phase 2)</div>} />
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
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
