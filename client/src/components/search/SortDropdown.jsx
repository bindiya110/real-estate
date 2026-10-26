import { ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS } from '../../constants';

export default function SortDropdown({ value = 'newest', onChange }) {
  return (
    <div className="relative">
      <label htmlFor="sort" className="sr-only">Sort by</label>
      <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <select
        id="sort"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-lg border border-sand-300 bg-white pr-8 pl-9 text-sm font-medium text-ink-800 hover:border-ink-200 focus:border-accent-500 focus:outline-none"
      >
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
