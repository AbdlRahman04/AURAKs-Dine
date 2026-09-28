export const studentPageLoaders = {
  '/menu': () => import('@/pages/MenuPage'),
  '/checkout': () => import('@/pages/CheckoutPage'),
  '/orders': () => import('@/pages/OrdersPage'),
  '/notifications': () => import('@/pages/NotificationsPage'),
  '/favorites': () => import('@/pages/FavoritesPage'),
  '/profile': () => import('@/pages/ProfilePage'),
  '/feedback': () => import('@/pages/FeedbackPage'),
} as const;

export type StudentPagePath = keyof typeof studentPageLoaders;

export function preloadStudentPage(path: StudentPagePath) {
  void studentPageLoaders[path]().catch(() => {
    // Let the route's normal lazy import surface any loading failure on navigation.
  });
}
