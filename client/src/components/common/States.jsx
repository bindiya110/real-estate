import { CircleAlert, Inbox, LoaderCircle, RotateCcw } from 'lucide-react';
import { getErrorMessage } from '../../services/api';
import { cn } from '../../utils/format';
import Button from './Button';

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center rounded-xl border border-dashed border-sand-300 bg-white px-6 py-14 text-center', className)}>
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-sand-100 text-ink-400">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, title = 'We could not load this', onRetry, className }) {
  return (
    <div role="alert" className={cn('flex flex-col items-center rounded-xl border border-red-100 bg-red-50/40 px-6 py-12 text-center', className)}>
      <span className="mb-4 grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
        <CircleAlert className="size-6" aria-hidden />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-ink-500">{getErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-5" icon={RotateCcw} onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function LoadingSpinner({ label = 'Loading', className, size = 'md' }) {
  const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' };
  return (
    <div role="status" className={cn('flex items-center justify-center gap-2 text-ink-400', className)}>
      <LoaderCircle className={cn('animate-spin', sizes[size])} aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageLoader() {
  return <LoadingSpinner className="min-h-[50vh]" size="lg" label="Loading page" />;
}

export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-sand-200/70', className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-linear-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonLoader({ count = 6, className }) {
  return (
    <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-3', className)} aria-busy="true" aria-label="Loading properties">
      {Array.from({ length: count }, (_, i) => <PropertyCardSkeleton key={i} />)}
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-3 p-4" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}
    </div>
  );
}
