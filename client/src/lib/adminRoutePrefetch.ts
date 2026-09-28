const adminPageImports: Record<string, () => Promise<unknown>> = {
  '/admin': () => import('@/pages/admin/KitchenDisplayPage'),
  '/admin/menu': () => import('@/pages/admin/MenuManagementPage'),
  '/admin/orders': () => import('@/pages/admin/AllOrdersPage'),
  '/admin/feedback': () => import('@/pages/admin/FeedbackManagementPage'),
  '/admin/users': () => import('@/pages/admin/UserManagementPage'),
  '/admin/analytics': () => import('@/pages/admin/AnalyticsPage'),
  '/admin/monitoring': () => import('@/pages/admin/MonitoringPage'),
};

const prefetchedRoutes = new Set<string>();

export function prefetchAdminRoute(path: string) {
  const loadPage = adminPageImports[path];
  if (!loadPage || prefetchedRoutes.has(path)) return;

  prefetchedRoutes.add(path);
  void loadPage().catch(() => prefetchedRoutes.delete(path));
}
