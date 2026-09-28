import { useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ShoppingCart as ShoppingCartIcon, User, LogOut, Package, Heart, MessageSquare, LayoutDashboard, Bell } from 'lucide-react';
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
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { preloadStudentPage } from '@/lib/studentRoutePrefetch';
import aurakLogo from '@/assets/aurak-logo.png';

export default function StudentHeader() {
  const { user, isAdmin, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const { dir, t } = useLanguage();
  const [location] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);

  const itemCount = getItemCount();

  const handleLogout = async () => {
    try {
      await apiRequest('POST', '/api/auth/logout', {});
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

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
      <header className="student-header sticky top-0 z-40 w-full">
        <div className="menu-shell">
          <div className="student-header-row">
            {/* Logo */}
            <Link 
              href="/menu" 
              className="student-brand"
              onMouseEnter={() => preloadStudentPage('/menu')}
              onFocus={() => preloadStudentPage('/menu')}
            >
              <img
                src={aurakLogo}
                  alt="AURAK's Dine logo"
                  className="student-brand-mark"
              />

              <span className="student-brand-copy">
                <span>AURAK&apos;S Dine</span>
                <small>Campus kitchen</small>
              </span>
            </Link>

            {/* Navigation */}
            <nav className="student-nav hidden md:flex" aria-label="Primary navigation">
              <Link 
                href="/menu"
                className={`student-nav-link ${
                  location === '/menu' ? 'is-active' : ''
                }`}
                data-testid="link-menu"
                onMouseEnter={() => preloadStudentPage('/menu')}
                onFocus={() => preloadStudentPage('/menu')}
              >
                {t('menu')}
              </Link>
              {isAuthenticated && (
                <Link
                  href="/orders"
                  className={`student-nav-link ${
                    location === '/orders' ? 'is-active' : ''
                  }`}
                  data-testid="link-orders"
                  onMouseEnter={() => preloadStudentPage('/orders')}
                  onFocus={() => preloadStudentPage('/orders')}
                >
                  {t('orders')}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  href="/favorites"
                  className={`student-nav-link ${
                    location === '/favorites' ? 'is-active' : ''
                  }`}
                  data-testid="link-favorites"
                  onMouseEnter={() => preloadStudentPage('/favorites')}
                  onFocus={() => preloadStudentPage('/favorites')}
                >
                  {t('favorites')}
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  href="/feedback"
                  className={`student-nav-link ${
                    location === '/feedback' ? 'is-active' : ''
                  }`}
                  data-testid="link-feedback"
                  onMouseEnter={() => preloadStudentPage('/feedback')}
                  onFocus={() => preloadStudentPage('/feedback')}
                >
                  {t('feedback')}
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href="/admin"
                  className={`student-nav-link ${
                    location.startsWith('/admin') ? 'is-active' : ''
                  }`}
                  data-testid="link-admin"
                >
                  {t('admin')}
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="student-header-actions">
              {/* Language and Theme Toggles */}
              <div className="student-header-toggles">
                <ThemeToggle />
                <LanguageToggle />
              </div>
              
              {/* Cart Button */}
              <Button
                ref={cartTriggerRef}
                variant="ghost"
                size="icon"
                className="student-icon-button student-cart-trigger relative"
                onClick={() => setCartOpen(true)}
                data-testid="button-cart"
                aria-label={`${t('openCart')} (${itemCount} ${t('cartItemCount')})`}
              >
                <ShoppingCartIcon className="w-5 h-5" aria-hidden="true" />
                {itemCount > 0 && (
                  <Badge
                    className="student-cart-count absolute flex items-center justify-center"
                    data-testid="badge-cart-count"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="student-user-button relative" data-testid="button-user-menu" aria-label={t('openAccountMenu')}>
                    <Avatar className="student-avatar">
                      <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || 'User'} />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={dir === 'rtl' ? 'start' : 'end'} className="w-56">
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
                    <Link href="/profile" className="flex w-full items-center gap-2" data-testid="link-profile" onMouseEnter={() => preloadStudentPage('/profile')} onFocus={() => preloadStudentPage('/profile')}>
                      <User className="h-4 w-4" />
                      <span>{t('profile')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex w-full items-center gap-2" data-testid="link-orders-menu" onMouseEnter={() => preloadStudentPage('/orders')} onFocus={() => preloadStudentPage('/orders')}>
                        <Package className="h-4 w-4" />
                        <span>{t('myOrders')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex w-full items-center gap-2" data-testid="link-notifications-menu" onMouseEnter={() => preloadStudentPage('/notifications')} onFocus={() => preloadStudentPage('/notifications')}>
                      <Bell className="h-4 w-4" />
                      <span>{t('notifications')}</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAuthenticated && (
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="flex w-full items-center gap-2" data-testid="link-favorites-menu" onMouseEnter={() => preloadStudentPage('/favorites')} onFocus={() => preloadStudentPage('/favorites')}>
                        <Heart className="h-4 w-4" />
                        <span>{t('favorites')}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="link-logout" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="student-mobile-nav flex md:hidden" aria-label="Mobile navigation">
            <Link 
              href="/menu"
              className={`student-mobile-link ${
                location === '/menu' ? 'is-active' : ''
              }`}
              onMouseEnter={() => preloadStudentPage('/menu')}
              onFocus={() => preloadStudentPage('/menu')}
            >
              <span>{t('menu')}</span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`student-mobile-link ${
                  location === '/orders' ? 'is-active' : ''
                }`}
                onMouseEnter={() => preloadStudentPage('/orders')}
                onFocus={() => preloadStudentPage('/orders')}
              >
                <Package className="w-5 h-5" aria-hidden="true" />
                <span>{t('orders')}</span>
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/favorites"
                className={`student-mobile-link ${
                  location === '/favorites' ? 'is-active' : ''
                }`}
                onMouseEnter={() => preloadStudentPage('/favorites')}
                onFocus={() => preloadStudentPage('/favorites')}
              >
                <Heart className="w-5 h-5" aria-hidden="true" />
                <span>{t('favorites')}</span>
              </Link>
            )}
            <Link
              href="/notifications"
              className={`student-mobile-link ${location === '/notifications' ? 'is-active' : ''}`}
              data-testid="link-notifications-mobile"
              onMouseEnter={() => preloadStudentPage('/notifications')}
              onFocus={() => preloadStudentPage('/notifications')}
            >
              <Bell className="w-5 h-5" aria-hidden="true" />
              <span>{t('notifications')}</span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/feedback"
                className={`student-mobile-link ${
                  location === '/feedback' ? 'is-active' : ''
                }`}
                onMouseEnter={() => preloadStudentPage('/feedback')}
                onFocus={() => preloadStudentPage('/feedback')}
              >
                <MessageSquare className="w-5 h-5" aria-hidden="true" />
                <span>{t('feedback')}</span>
              </Link>
            )}
            <Link 
              href="/profile"
              className={`student-mobile-link ${
                location === '/profile' ? 'is-active' : ''
              }`}
              onMouseEnter={() => preloadStudentPage('/profile')}
              onFocus={() => preloadStudentPage('/profile')}
            >
              <User className="w-5 h-5" aria-hidden="true" />
              <span>{t('profile')}</span>
            </Link>
            {isAdmin && (
              <Link 
                href="/admin"
                className={`student-mobile-link ${
                  location.startsWith('/admin') ? 'is-active' : ''
                }`}
                data-testid="link-admin-mobile"
              >
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                <span>{t('admin')}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Shopping Cart Drawer */}
      <ShoppingCart open={cartOpen} onOpenChange={setCartOpen} triggerRef={cartTriggerRef} />
    </>
  );
}
