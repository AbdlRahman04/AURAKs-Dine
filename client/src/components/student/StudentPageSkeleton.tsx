import { Skeleton } from '@/components/ui/skeleton';
import type { StudentPagePath } from '@/lib/studentRoutePrefetch';

type StudentPageSkeletonProps = {
  path: StudentPagePath;
};

const pageTitles: Record<StudentPagePath, string> = {
  '/menu': 'menu',
  '/checkout': 'checkout',
  '/orders': 'orders',
  '/notifications': 'notifications',
  '/favorites': 'favorites',
  '/profile': 'profile',
  '/feedback': 'feedback',
};

function MenuSkeleton() {
  return (
    <>
      <div className="mb-10 space-y-3 rounded-2xl border bg-card p-6 sm:p-10">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>
      <div className="mb-6 space-y-4">
        <Skeleton className="h-11 w-full max-w-xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-9 w-20 rounded-full" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function OrdersSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-48 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="space-y-4" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5">
            <div className="mb-4 flex flex-wrap justify-between gap-4">
              <Skeleton className="h-6 w-44 max-w-full" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ))}
      </div>
    </>
  );
}

function FavoritesSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-52 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="h-56 w-full rounded-none md:h-64" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function FormSkeleton({ profile = false }: { profile?: boolean }) {
  return (
    <>
      <div className="mb-8 space-y-3">
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="rounded-xl border bg-card p-6 sm:p-8" aria-hidden="true">
        {!profile && <div className="mb-6 space-y-3 border-b pb-6"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-72 max-w-full" /></div>}
        {profile && <div className="mb-7 flex items-center gap-4"><Skeleton className="h-20 w-20 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-48 max-w-full" /><Skeleton className="h-3 w-28" /></div></div>}
        <div className={profile ? 'grid grid-cols-1 gap-5 sm:grid-cols-2' : 'space-y-6'}>
          {Array.from({ length: profile ? 7 : 5 }, (_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              {!profile && index === 2 && <Skeleton className="h-3 w-56 max-w-full" />}
            </div>
          ))}
        </div>
        <Skeleton className="mt-7 h-11 w-full" />
      </div>
    </>
  );
}

function CheckoutSkeleton() {
  return (
    <>
      <div className="mb-8 space-y-3"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-72 max-w-full" /></div>
      <div className="grid gap-6 lg:grid-cols-3" aria-hidden="true">
        <div className="space-y-5 lg:col-span-2">
          {[0, 1, 2].map((index) => <div key={index} className="space-y-4 rounded-xl border bg-card p-6"><Skeleton className="h-6 w-44" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div>)}
        </div>
        <div className="h-80 rounded-xl border bg-card p-6"><Skeleton className="mb-6 h-6 w-36" /><Skeleton className="mb-4 h-4 w-full" /><Skeleton className="mb-4 h-4 w-3/4" /><Skeleton className="mt-8 h-11 w-full" /></div>
      </div>
    </>
  );
}

export function StudentPageSkeleton({ path }: StudentPageSkeletonProps) {
  const isMenu = path === '/menu';
  const widthClass = isMenu ? 'max-w-7xl' : path === '/orders' || path === '/notifications' ? 'max-w-4xl' : path === '/checkout' ? 'max-w-7xl' : path === '/favorites' ? 'max-w-7xl' : 'max-w-2xl';

  return (
    <div className="student-page-shell min-h-screen bg-background" role="status" aria-label={`Loading ${pageTitles[path]}`} aria-busy="true">
      <div className="sticky top-0 z-40 border-b bg-background" aria-hidden="true">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:h-20 sm:px-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-3"><Skeleton className="h-10 w-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div>
          <div className="hidden items-center gap-5 md:flex"><Skeleton className="h-4 w-12" /><Skeleton className="h-4 w-14" /><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
          <div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-10 w-10 rounded-full" /></div>
        </div>
        <div className="flex h-12 items-center justify-around border-t px-2 md:hidden" aria-hidden="true"><Skeleton className="h-7 w-12" /><Skeleton className="h-7 w-12" /><Skeleton className="h-7 w-12" /><Skeleton className="h-7 w-12" /></div>
      </div>
      <main id="main-content" className={`mx-auto min-h-[calc(100vh-9rem)] w-full ${widthClass} px-4 py-8 sm:px-6 lg:px-8`} aria-hidden="true">
        {path === '/menu' && <MenuSkeleton />}
        {path === '/checkout' && <CheckoutSkeleton />}
        {path === '/orders' && <OrdersSkeleton />}
        {path === '/notifications' && <OrdersSkeleton />}
        {path === '/favorites' && <FavoritesSkeleton />}
        {path === '/feedback' && <FormSkeleton />}
        {path === '/profile' && <FormSkeleton profile />}
      </main>
      <div className="h-32 border-t bg-muted/20" aria-hidden="true" />
      <span className="sr-only">Loading {pageTitles[path]}</span>
    </div>
  );
}
