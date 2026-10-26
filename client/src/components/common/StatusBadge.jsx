import { INQUIRY_STATUS, PROPERTY_STATUS } from '../../constants';
import { capitalize, cn } from '../../utils/format';

const TONES = {
  neutral: 'bg-sand-100 text-ink-600 ring-sand-300',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  danger: 'bg-red-50 text-red-700 ring-red-200',
  accent: 'bg-accent-50 text-accent-700 ring-accent-200',
  dark: 'bg-ink-900 text-white ring-ink-900',
};

export function Badge({ tone = 'neutral', className, children }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset whitespace-nowrap', TONES[tone], className)}>
      {children}
    </span>
  );
}

const MAPS = { property: PROPERTY_STATUS, inquiry: INQUIRY_STATUS };
const GENERIC = { active: 'success', suspended: 'danger', resolved: 'success', 'in-progress': 'warning', new: 'info' };

export default function StatusBadge({ status, type = 'property', className }) {
  const config = MAPS[type]?.[status];
  return (
    <Badge tone={config?.tone ?? GENERIC[status] ?? 'neutral'} className={className}>
      {config?.label ?? capitalize(status)}
    </Badge>
  );
}
