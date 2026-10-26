import { cn } from '../../utils/format';

export default function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <label className={cn('flex items-start justify-between gap-4', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <span>
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-400">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-sand-300 transition-colors peer-checked:bg-accent-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500" />
        <span className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}
