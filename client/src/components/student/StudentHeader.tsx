import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart as ShoppingCartIcon, User, LogOut, Package, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/contexts/CartContext';
import ShoppingCart from './ShoppingCart';

export default function StudentHeader() {
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const [location] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  const itemCount = getItemCount();

  const getInitials = () => {
    if (!user) return 'U';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link 
              href="/menu" 
              className="text-xl sm:text-2xl font-bold text-brand-red hover:opacity-90 transition-opacity"
            >
              AURAK Cafeteria
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/menu"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/menu' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-menu"
              >
                Menu
              </Link>
              <Link 
                href="/orders"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/orders' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-orders"
              >
                Orders
              </Link>
              <Link 
                href="/favorites"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/favorites' ? 'text-foreground' : 'text-muted-foreground'
                }`}
                data-testid="link-favorites"
              >
                Favorites
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen(true)}
                data-testid="button-cart"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    data-testid="badge-cart-count"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || 'User'} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.email}
                      </p>
                      {user?.studentId && (
                        <p className="text-xs leading-none text-muted-foreground">
                          ID: {user.studentId}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center w-full" data-testid="link-profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center w-full" data-testid="link-orders-menu">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" className="flex items-center w-full" data-testid="link-favorites-menu">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center w-full" data-testid="link-logout">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-around pb-3 border-t pt-3 -mx-4 px-4">
            <Link 
              href="/menu"
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                location === '/menu' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span>Menu</span>
            </Link>
            <Link 
              href="/orders"
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                location === '/orders' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </Link>
            <Link 
              href="/favorites"
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                location === '/favorites' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>Favorites</span>
            </Link>
            <Link 
              href="/profile"
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                location === '/profile' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Shopping Cart Drawer */}
      <ShoppingCart open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
