import { useId } from 'react';
import { cn } from '../../utils/format';

/** Label + control + hint/error wrapper. Children receive the generated id and aria props. */
export default function Field({ label, error, hint, required, className, children, id: providedId }) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
          {required && <span className="ml-0.5 text-accent-600" aria-hidden>*</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}
