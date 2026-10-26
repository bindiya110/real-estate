import { forwardRef } from 'react';
import Field from './Field';
import { cn } from '../../utils/format';

const TextAreaField = forwardRef(function TextAreaField(
  { label, error, hint, required, className, textareaClassName, rows = 4, id, ...props },
  ref,
) {
  return (
    <Field label={label} error={error} hint={hint} required={required} className={className} id={id}>
      {(aria) => <textarea ref={ref} rows={rows} className={cn('field-control resize-y leading-relaxed', textareaClassName)} {...aria} {...props} />}
    </Field>
  );
});

export default TextAreaField;
