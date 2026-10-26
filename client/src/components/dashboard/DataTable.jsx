import { EmptyState, ErrorState, TableSkeleton } from '../common/States';
import { cn } from '../../utils/format';

/**
 * Responsive table: a regular table from md up, stacked cards on small screens.
 * columns: [{ key, header, render(row), className, hideOnMobile, primary }]
 */
export default function DataTable({ columns, rows, isLoading, error, onRetry, emptyTitle = 'No records', emptyDescription, emptyAction, rowKey = '_id' }) {
  if (isLoading) return <div className="card"><TableSkeleton /></div>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (!rows?.length) return <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />;

  return (
    <>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sand-200 bg-sand-50 text-xs font-semibold tracking-wide text-ink-500 uppercase">
            <tr>
              {columns.map((col) => (
                <th key={col.key} scope="col" className={cn('px-4 py-3 whitespace-nowrap', col.className)}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-200">
            {rows.map((row) => (
              <tr key={row[rowKey]} className="hover:bg-sand-50/70">
                {columns.map((col) => (
                  <td key={col.key} className={cn('px-4 py-3 align-middle', col.className)}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row[rowKey]} className="card space-y-3 p-4">
            {columns.filter((c) => !c.hideOnMobile).map((col) => (
              <div key={col.key} className={cn(!col.primary && 'flex items-center justify-between gap-4')}>
                {!col.primary && col.header && <span className="text-xs font-medium text-ink-400">{col.header}</span>}
                <div className={cn(!col.primary && 'text-right text-sm')}>{col.render ? col.render(row) : row[col.key]}</div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </>
  );
}
