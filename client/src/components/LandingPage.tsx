import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, ShoppingBag, TrendingUp, Utensils } from "lucide-react";
import { useLocation } from "wouter";
import aurakLogo from "@/assets/aurak-logo.png";

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src={aurakLogo}
                alt="AURAK's Dine logo"
                className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              AURAK'S Dine
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Skip the queue. Order your favorite meals online and pick them up at your convenience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 min-h-12"
                onClick={() => setLocation('/register')}
                data-testid="button-register"
              >
                Get Started
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 min-h-12"
                onClick={() => setLocation('/login')}
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Why Order Online?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Save time, reduce waste, and enjoy your meals on your schedule
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover-elevate" data-testid="card-feature-skip-queue">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skip the Queue</h3>
            <p className="text-muted-foreground">
              Pre-order your meals and skip the waiting line during peak hours
            </p>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-feature-easy-ordering">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy Ordering</h3>
            <p className="text-muted-foreground">
              Browse menus, customize items, and checkout in just a few clicks
            </p>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-feature-track-order">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Your Order</h3>
            <p className="text-muted-foreground">
              Real-time updates from order confirmation to ready for pickup
            </p>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-feature-reduce-waste">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Reduce Waste</h3>
            <p className="text-muted-foreground">
              Help the cafeteria estimate demand and minimize food waste
            </p>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-muted/50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Four simple steps to get your meal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: 1, title: "Browse Menu", description: "Choose from breakfast, lunch, snacks, and beverages" },
              { step: 2, title: "Add to Cart", description: "Select items, customize, and add to your cart" },
              { step: 3, title: "Choose Pickup Time", description: "Select a convenient pickup time slot" },
              { step: 4, title: "Pay & Pickup", description: "Complete payment and pick up your order" },
            ].map((item) => (
              <div key={item.step} className="text-center" data-testid={`step-${item.step}`}>
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Card className="p-12 text-center bg-primary text-primary-foreground">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Sign in with your student account to start ordering
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 min-h-12"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-cta-login"
          >
            Sign In Now
          </Button>
        </Card>
      </div>
    </div>
  );
}
