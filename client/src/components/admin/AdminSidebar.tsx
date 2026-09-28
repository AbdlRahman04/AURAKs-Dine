import { Link, useLocation } from 'wouter';
import {
  BarChart3,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Activity,
  Package,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import aurakLogo from '@/assets/aurak-logo.png';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { prefetchAdminRoute } from '@/lib/adminRoutePrefetch';

const navItems = [
  { href: '/admin', label: 'Kitchen Display', shortLabel: 'Kitchen', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'Menu Management', shortLabel: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/orders', label: 'All Orders', shortLabel: 'Orders', icon: Package },
  { href: '/admin/feedback', label: 'Customer Feedback', shortLabel: 'Feedback', icon: MessageSquare },
  { href: '/admin/users', label: 'User Management', shortLabel: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', shortLabel: 'Analytics', icon: BarChart3 },
  { href: '/admin/monitoring', label: 'System Health', shortLabel: 'Health', icon: Activity },
];

export default function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

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
    if (!user) return 'A';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return 'A';
  };

  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <Link href="/admin">
          <a className="admin-brand-lockup" aria-label="AURAK's Dine admin home">
            <span className="admin-brand-mark">
              <img src={aurakLogo} alt="" />
            </span>
            <span className="admin-brand-copy">
              <span className="admin-brand-name">AURAK'S Dine</span>
              <span className="admin-brand-label">Operations desk</span>
            </span>
          </a>
        </Link>
        <div className="admin-sidebar-controls">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className="admin-sidebar-section-label">Workspace</div>
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`admin-nav-link ${isActive ? 'is-active' : ''}`}
                data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                aria-current={isActive ? 'page' : undefined}
                onMouseEnter={() => prefetchAdminRoute(item.href)}
                onFocus={() => prefetchAdminRoute(item.href)}
              >
                <Icon className="admin-nav-icon" aria-hidden="true" />
                <span className="admin-nav-label">{item.label}</span>
                <span className="admin-nav-short-label">{item.shortLabel}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <Link href="/menu">
          <a
            className={`admin-home-link ${location === '/menu' || location === '/' ? 'is-active' : ''}`}
            data-testid="link-home"
          >
            <Home className="admin-nav-icon" aria-hidden="true" />
            <span className="admin-nav-label">Customer menu</span>
            <span className="admin-nav-short-label">Menu</span>
          </a>
        </Link>

        <div className="admin-account">
          <Avatar className="admin-account-avatar">
            <AvatarImage src={user?.profileImageUrl || undefined} alt="Admin profile" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="admin-account-copy">
            <p className="admin-account-name">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Admin'}
            </p>
            <p className="admin-account-email">{user?.email}</p>
          </div>
        </div>
        <Button className="admin-logout-button" variant="outline" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="admin-nav-icon" aria-hidden="true" />
          <span className="admin-nav-label">{t('logout')}</span>
          <span className="admin-nav-short-label">Exit</span>
        </Button>
      </div>
    </aside>
  );
}
