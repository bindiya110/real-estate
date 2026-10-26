import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Simple URL-backed state for admin tables. Changing anything but `page` resets to page 1. */
export default function useUrlParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const update = useCallback(
    (changes) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([k, v]) => (v === undefined || v === '' || v === null ? next.delete(k) : next.set(k, String(v))));
        if (!('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  return [params, update];
}
