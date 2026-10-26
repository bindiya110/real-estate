import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Field from './Field';
import { cn } from '../../utils/format';

/** Text input that works with react-hook-form's `register()` spread. */
const InputField = forwardRef(function InputField(
  { label, error, hint, required, className, inputClassName, type = 'text', icon: Icon, suffix, id, ...props },
  ref,
) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <Field label={label} error={error} hint={hint} required={required} className={className} id={id}>
      {(aria) => (
        <div className="relative">
          {Icon && <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" aria-hidden />}
          <input
            ref={ref}
            type={isPassword && showPassword ? 'text' : type}
            className={cn('field-control', Icon && 'pl-10', (isPassword || suffix) && 'pr-11', inputClassName)}
            {...aria}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-ink-400 hover:text-ink-800"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          )}
          {suffix && !isPassword && <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-sm text-ink-400">{suffix}</span>}
        </div>
      )}
    </Field>
  );
});

export default InputField;
