import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '../../utils/format';

const TONES = {
  error: ['border-red-200 bg-red-50 text-red-800', CircleAlert],
  success: ['border-emerald-200 bg-emerald-50 text-emerald-800', CircleCheck],
  info: ['border-sky-200 bg-sky-50 text-sky-800', Info],
};

export default function FormAlert({ tone = 'error', children, className }) {
  if (!children) return null;
  const [classes, Icon] = TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={cn('flex gap-2.5 rounded-lg border px-3.5 py-3 text-sm', classes, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div>{children}</div>
    </div>
  );
}
