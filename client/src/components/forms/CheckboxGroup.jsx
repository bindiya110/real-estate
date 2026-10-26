import { Check } from 'lucide-react';
import { cn } from '../../utils/format';

/** Controlled multi-select rendered as toggle chips. */
export default function CheckboxGroup({ label, options, value = [], onChange, className, columns = false, error }) {
  const toggle = (v) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <fieldset className={className}>
      {label && <legend className="field-label">{label}</legend>}
      <div className={cn(columns ? 'grid grid-cols-2 gap-2 sm:grid-cols-3' : 'flex flex-wrap gap-2')}>
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <label
              key={opt.value}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors has-focus-visible:outline-2 has-focus-visible:outline-accent-500',
                checked ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-300 bg-white text-ink-700 hover:border-ink-200',
              )}
            >
              <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggle(opt.value)} />
              <span className={cn('grid size-4 place-items-center rounded border', checked ? 'border-white bg-white text-ink-900' : 'border-sand-300')}>
                {checked && <Check className="size-3" strokeWidth={3} aria-hidden />}
              </span>
              {opt.label}
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>}
    </fieldset>
  );
}
