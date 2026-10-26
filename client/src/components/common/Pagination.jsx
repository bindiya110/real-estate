import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/format';

function pageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…');
    result.push(p);
  });
  return result;
}

export default function Pagination({ meta, onPageChange, className }) {
  if (!meta || meta.totalPages <= 1) return null;
  const { page, totalPages } = meta;
  const go = (p) => {
    onPageChange(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const btn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors';

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
      <button type="button" className={cn(btn, 'border-sand-300 bg-white hover:bg-sand-50 disabled:opacity-40')} disabled={page <= 1} onClick={() => go(page - 1)} aria-label="Previous page">
        <ChevronLeft className="size-4" />
      </button>
      <span className="px-2 text-sm text-ink-500 sm:hidden">
        Page {page} of {totalPages}
      </span>
      <div className="hidden items-center gap-1.5 sm:flex">
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-1 text-ink-400">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === page ? 'page' : undefined}
              className={cn(btn, p === page ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-300 bg-white hover:bg-sand-50')}
            >
              {p}
            </button>
          ),
        )}
      </div>
      <button type="button" className={cn(btn, 'border-sand-300 bg-white hover:bg-sand-50 disabled:opacity-40')} disabled={page >= totalPages} onClick={() => go(page + 1)} aria-label="Next page">
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
