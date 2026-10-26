import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../utils/format';

/** items: [{ label, to? }] — the last item is the current page. */
export default function Breadcrumbs({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-400">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex min-w-0 items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-ink-900">{item.label}</Link>
              ) : (
                <span className={cn('truncate', last && 'font-medium text-ink-700')} aria-current={last ? 'page' : undefined}>{item.label}</span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
