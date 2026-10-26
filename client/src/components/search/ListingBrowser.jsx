import { useEffect, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react';
import propertyService from '../../services/propertyService';
import contentService from '../../services/contentService';
import usePropertyFilters from '../../hooks/usePropertyFilters';
import useDebounce from '../../hooks/useDebounce';
import queryKeys from '../../hooks/queryKeys';
import PropertyGrid from '../property/PropertyGrid';
import PropertyFilters from './PropertyFilters';
import SortDropdown from './SortDropdown';
import ActiveFilterChips from './ActiveFilterChips';
import Pagination from '../common/Pagination';
import Container from '../common/Container';
import Button from '../common/Button';
import { cn } from '../../utils/format';

const VIEW_KEY = 'estatehub:view';

function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'grid';
  } catch {
    return 'grid';
  }
}

/** Shared body of the Buy and Rent pages: URL-synced filters, search, sort, view toggle and pagination. */
export default function ListingBrowser({ listingType }) {
  const { filters, apiParams, setFilters, clearFilters, activeCount } = usePropertyFilters();
  const [view, setView] = useState(readView);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keyword, setKeyword] = useState(filters.q ?? '');
  const debouncedKeyword = useDebounce(keyword, 450);

  useEffect(() => setKeyword(filters.q ?? ''), [filters.q]);
  useEffect(() => {
    if ((filters.q ?? '') !== debouncedKeyword.trim()) setFilters({ q: debouncedKeyword.trim() || undefined }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const params = { ...apiParams, listingType, limit: 12 };
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.properties.search(params),
    queryFn: () => propertyService.search(params),
    placeholderData: keepPreviousData,
  });

  const { data: categoriesRes } = useQuery({ queryKey: queryKeys.content.categories, queryFn: contentService.categories, staleTime: 10 * 60_000 });
  const categories = categoriesRes?.data ?? [];

  const changeView = (v) => {
    setView(v);
    try {
      localStorage.setItem(VIEW_KEY, v);
    } catch {
      /* storage unavailable */
    }
  };

  const total = data?.meta?.total ?? 0;
  const filterPanel = <PropertyFilters filters={filters} setFilters={setFilters} clearFilters={clearFilters} listingType={listingType} categories={categories} />;

  return (
    <Container className="py-8 lg:py-10">
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">{filterPanel}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <label htmlFor="keyword" className="sr-only">Search listings</label>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
              <input
                id="keyword"
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by title, locality or keyword"
                className="field-control h-10 pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" icon={SlidersHorizontal} className="h-10 lg:hidden" onClick={() => setDrawerOpen(true)} aria-controls="filter-drawer" aria-expanded={drawerOpen}>
                Filters{activeCount > 0 && <span className="ml-1 grid size-5 place-items-center rounded-full bg-accent-500 text-[11px] text-white">{activeCount}</span>}
              </Button>
              <SortDropdown value={filters.sort ?? 'newest'} onChange={(sort) => setFilters({ sort: sort === 'newest' ? undefined : sort })} />
              <div className="hidden rounded-lg border border-sand-300 bg-white p-0.5 sm:flex" role="group" aria-label="Layout">
                {[['grid', LayoutGrid], ['list', List]].map(([v, Icon]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => changeView(v)}
                    aria-pressed={view === v}
                    aria-label={`${v} view`}
                    className={cn('grid size-8 place-items-center rounded-md', view === v ? 'bg-ink-900 text-white' : 'text-ink-500 hover:text-ink-900')}
                  >
                    <Icon className="size-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-ink-500" aria-live="polite">
              {isLoading ? 'Searching…' : (
                <>
                  <span className="font-semibold text-ink-900">{total.toLocaleString('en-IN')}</span> {total === 1 ? 'property' : 'properties'} {listingType === 'rent' ? 'for rent' : 'for sale'}
                  {isFetching && <span className="ml-2 text-ink-300">Updating…</span>}
                </>
              )}
            </p>
            <ActiveFilterChips filters={filters} setFilters={setFilters} clearFilters={clearFilters} categories={categories} />
          </div>

          <div className={cn('mt-6 transition-opacity', isFetching && !isLoading && 'opacity-60')}>
            <PropertyGrid
              properties={data?.data}
              isLoading={isLoading}
              error={error}
              onRetry={refetch}
              layout={view}
              columns={view === 'list' ? 1 : 3}
              emptyTitle="No matching properties"
              emptyDescription="Try widening your price range, removing a filter or searching a nearby area."
              emptyAction={activeCount > 0 && <Button variant="secondary" size="sm" onClick={clearFilters}>Clear all filters</Button>}
            />
          </div>

          <Pagination meta={data?.meta} onPageChange={(page) => setFilters({ page: page > 1 ? page : undefined })} className="mt-10" />
        </div>
      </div>

      {/* Mobile filter drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', drawerOpen ? 'visible' : 'invisible')}>
        <div className={cn('absolute inset-0 bg-ink-950/40 transition-opacity', drawerOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setDrawerOpen(false)} aria-hidden />
        <div
          id="filter-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn('absolute inset-y-0 left-0 flex w-[min(22rem,90vw)] flex-col bg-white shadow-lift transition-transform duration-200', drawerOpen ? 'translate-x-0' : '-translate-x-full')}
        >
          <div className="flex items-center justify-end border-b border-sand-200 p-2">
            <button type="button" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2 hover:bg-sand-100" aria-label="Close filters">
              <X className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{filterPanel}</div>
          <div className="border-t border-sand-200 p-4">
            <Button className="w-full" onClick={() => setDrawerOpen(false)}>Show {total} results</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
