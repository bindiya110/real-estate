import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

/** Search box + filter controls row shared by admin list pages. */
export default function AdminToolbar({ search, onSearch, placeholder = 'Search…', children }) {
  const [value, setValue] = useState(search ?? '');
  const debounced = useDebounce(value, 400);

  useEffect(() => setValue(search ?? ''), [search]);
  useEffect(() => {
    if ((search ?? '') !== debounced.trim()) onSearch(debounced.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <label htmlFor="admin-search" className="sr-only">Search</label>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
        <input id="admin-search" type="search" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} className="field-control h-10 pl-10" />
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value || undefined)} className="h-10 cursor-pointer rounded-lg border border-sand-300 bg-white pr-8 pl-3 text-sm font-medium text-ink-700 hover:border-ink-200 focus:border-accent-500 focus:outline-none">
        <option value="">{label}: All</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
