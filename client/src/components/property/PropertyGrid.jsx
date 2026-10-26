import PropertyCard from './PropertyCard';
import { EmptyState, ErrorState, SkeletonLoader } from '../common/States';
import { cn } from '../../utils/format';

export default function PropertyGrid({
  properties, isLoading, error, onRetry, layout = 'grid', columns = 3, skeletonCount = 6, emptyTitle = 'No properties found', emptyDescription, emptyAction,
}) {
  const gridCols = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[columns];

  if (isLoading) return <SkeletonLoader count={skeletonCount} className={layout === 'list' ? 'grid-cols-1! lg:grid-cols-1!' : gridCols} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!properties?.length) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  return (
    <div className={cn('grid gap-5', layout === 'list' ? 'grid-cols-1' : gridCols)}>
      {properties.map((p) => <PropertyCard key={p._id} property={p} layout={layout} />)}
    </div>
  );
}
