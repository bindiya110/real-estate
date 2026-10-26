import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

const TONES = {
  ink: 'bg-ink-50 text-ink-700',
  accent: 'bg-accent-50 text-accent-600',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-red-50 text-red-600',
  info: 'bg-sky-50 text-sky-600',
};

export default function StatCard({ label, value, icon: Icon, tone = 'ink', hint, to }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && <span className={cn('grid size-9 place-items-center rounded-lg', TONES[tone])}><Icon className="size-4.5" aria-hidden /></span>}
      </div>
      <p className="font-display mt-2 text-3xl font-semibold text-ink-900">{value ?? '–'}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </>
  );
  const classes = 'card block p-5 transition-shadow';
  return to ? <Link to={to} className={cn(classes, 'hover:shadow-lift')}>{content}</Link> : <div className={classes}>{content}</div>;
}
