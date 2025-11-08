import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();

  // Only show 404 for actual invalid routes, not on valid pages
  const validRoutes = ['/', '/menu', '/checkout', '/orders', '/favorites', '/feedback', '/profile', '/admin', '/admin/menu', '/admin/orders', '/admin/feedback', '/admin/analytics'];
  
  // If we're on a valid route, don't show 404
  if (validRoutes.includes(location) || location.startsWith('/admin/')) {
    return null;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 space-y-4">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <h1 className="text-2xl font-bold">404 Page Not Found</h1>
          </div>

          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Button 
            onClick={() => setLocation('/menu')} 
            className="w-full"
            data-testid="button-back-to-menu"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
