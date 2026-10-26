import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export const FILTER_KEYS = [
  'q', 'city', 'location', 'propertyType', 'category', 'minPrice', 'maxPrice', 'bedrooms', 'bathrooms',
  'minArea', 'furnishing', 'amenities', 'availabilityStatus', 'sort', 'page',
];

const LIST_KEYS = ['propertyType', 'amenities', 'furnishing'];

/**
 * Keeps search filters in the URL so they survive refreshes, back/forward navigation and sharing.
 * Any change other than the page number resets pagination.
 */
export default function usePropertyFilters(defaults = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const result = { ...defaults };
    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key);
      if (value === null || value === '') continue;
      result[key] = LIST_KEYS.includes(key) ? value.split(',').filter(Boolean) : value;
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setFilters = useCallback(
    (updates, { replace = false } = {}) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
            if (empty) next.delete(key);
            else next.set(key, Array.isArray(value) ? value.join(',') : String(value));
          }
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => setSearchParams({}, { replace: false }), [setSearchParams]);

  /** Query params for the API: arrays become comma-separated strings. */
  const apiParams = useMemo(() => {
    const params = {};
    for (const [key, value] of Object.entries(filters)) {
      params[key] = Array.isArray(value) ? value.join(',') : value;
    }
    return params;
  }, [filters]);

  const activeCount = FILTER_KEYS.filter((k) => !['sort', 'page'].includes(k) && searchParams.get(k)).length;

  return { filters, apiParams, setFilters, clearFilters, activeCount };
}
