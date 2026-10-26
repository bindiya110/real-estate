import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import PropertyGrid from '../../components/property/PropertyGrid';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import favoriteService from '../../services/favoriteService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { EmptyState } from '../../components/common/States';

export default function FavoritesPage() {
  useDocumentTitle('Favorites');
  const [page, setPage] = useState(1);
  const params = { page, limit: 12 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.favorites.list(params),
    queryFn: () => favoriteService.list(params),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <PageTitle title="Saved properties" description="Homes you’ve saved. Tap the heart again to remove one." />
      {!isLoading && !error && !data?.data?.length ? (
        <EmptyState icon={Heart} title="No saved properties yet" description="Tap the heart on any listing to save it here." action={<Button to="/buy" size="sm">Browse properties</Button>} />
      ) : (
        <PropertyGrid properties={data?.data} isLoading={isLoading} error={error} onRetry={refetch} />
      )}
      <Pagination meta={data?.meta} onPageChange={setPage} className="mt-8" />
    </div>
  );
}
