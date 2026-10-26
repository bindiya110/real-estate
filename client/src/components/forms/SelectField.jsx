import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import Field from './Field';
import { cn } from '../../utils/format';

/** options: [{ value, label }] or plain strings. */
const SelectField = forwardRef(function SelectField(
  { label, error, hint, required, className, selectClassName, options = [], placeholder, id, ...props },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className} id={id}>
      {(aria) => (
        <div className="relative">
          <select ref={ref} className={cn('field-control appearance-none pr-10', selectClassName)} {...aria} {...props}>
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((opt) => {
              const value = typeof opt === 'object' ? opt.value : opt;
              const text = typeof opt === 'object' ? opt.label : opt;
              return <option key={value} value={value}>{text}</option>;
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        </div>
      )}
    </Field>
  );
});

export default SelectField;
