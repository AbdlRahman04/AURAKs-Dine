import { Bell, CheckCircle2, Clock3, PackageCheck, PackageOpen, XCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StudentHeader from '@/components/student/StudentHeader';
import Footer from '@/components/Footer';
import { useOrders } from '@/hooks/useOrders';
import { useOrderRealtime } from '@/hooks/useOrderRealtime';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOrderStatusColor } from '@/lib/utils';

const notificationCopy = {
  received: 'orderReceivedMessage',
  preparing: 'orderPreparingMessage',
  ready: 'orderReadyMessage',
  completed: 'orderCompletedMessage',
  cancelled: 'orderCancelledMessage',
} as const;

const statusIcons = {
  received: PackageOpen,
  preparing: Clock3,
  ready: PackageCheck,
  completed: CheckCircle2,
  cancelled: XCircle,
} as const;

export default function NotificationsPage() {
  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } = useOrders({ refetchInterval: 30_000 });
  const { isConnected } = useOrderRealtime();
  const { t, language } = useLanguage();
  const orders = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="student-page-shell min-h-screen bg-background flex flex-col">
      <StudentHeader />
      <main id="main-content" className="flex-grow">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden="true">
                <Bell className="h-5 w-5" />
              </span>
              <h1 className="text-3xl font-bold">{t('notifications')}</h1>
            </div>
            <p className="text-muted-foreground">{t('notificationsSubtitle')}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isConnected ? t('notificationsLiveNote') : t('notificationsRefreshNote')}
            </p>
          </div>

          {isLoading ? (
            <div className="space-y-3" role="status" aria-label={t('loading')}>
              {[0, 1, 2].map((item) => (
                <div key={item} className="flex gap-4 rounded-xl border bg-card p-5">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-3"><Skeleton className="h-5 w-44" /><Skeleton className="h-4 w-full max-w-lg" /><Skeleton className="h-3 w-32" /></div>
                </div>
              ))}
            </div>
          ) : isError && !data ? (
            <Card className="p-8 text-center" role="alert">
              <h2 className="mb-2 text-lg font-semibold">{t('notificationsLoadError')}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{t('notificationsLoadErrorHelp')}</p>
              <Button variant="outline" onClick={() => refetch()}>{t('tryAgain')}</Button>
            </Card>
          ) : orders.length ? (
            <div className="space-y-3" aria-label={t('notifications')}>
              {orders.map((order) => {
                const status = order.status in notificationCopy ? order.status as keyof typeof notificationCopy : 'received';
                const StatusIcon = statusIcons[status];
                const occurredAt = order.updatedAt ?? order.createdAt ?? new Date();
                const notificationDate = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);

                return (
                  <Card key={order.id}>
                    <CardContent className="flex items-start gap-4 p-5">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground" aria-hidden="true">
                        <StatusIcon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h2 className="font-semibold">{t('orderUpdateTitle')}</h2>
                          <Badge className={getOrderStatusColor(status)}>{t(status)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {t(notificationCopy[status])} <span className="font-medium text-foreground">{order.orderNumber}</span>
                        </p>
                        {order.paymentMethod === 'card' && order.paymentStatus === 'succeeded' && (
                          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            {t('paymentSuccessful')}
                          </p>
                        )}
                        <time className="mt-2 block text-xs text-muted-foreground" dateTime={notificationDate.toISOString()}>
                          {new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(notificationDate)}
                        </time>
                      </div>
                      <Button variant="outline" size="sm" asChild className="shrink-0">
                        <Link href="/orders">{t('viewOrderHistory')}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
              {hasNextPage && (
                <Button variant="outline" className="w-full" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? t('loading') : t('loadOlderNotifications')}
                </Button>
              )}
            </div>
          ) : (
            <Card className="py-16 text-center">
              <Bell className="mx-auto mb-4 h-14 w-14 text-muted-foreground" aria-hidden="true" />
              <h2 className="mb-2 text-xl font-semibold">{t('noNotifications')}</h2>
              <p className="mx-auto mb-6 max-w-md text-muted-foreground">{t('noNotificationsDescription')}</p>
              <Button asChild><Link href="/menu">{t('browseMenu')}</Link></Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
