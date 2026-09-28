import { Skeleton } from '@/components/ui/skeleton';

type AdminPageSkeletonProps = {
  label: string;
};

export function AdminPageSkeleton({ label }: AdminPageSkeletonProps) {
  return (
    <section className="admin-page-content space-y-6 p-4 md:p-6 lg:p-8" role="status" aria-label={`Loading ${label}`} aria-busy="true">
      <div className="space-y-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-56 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-card p-5">
            <Skeleton className="mb-4 h-3 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="hidden h-8 w-20 sm:block" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading {label}</span>
    </section>
  );
}
