import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/format';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/** Accessible modal dialog: traps focus, closes on Escape/backdrop, restores focus on close. */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md', dismissible = true }) {
  const panelRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const focusables = () => [...(panelRef.current?.querySelectorAll(FOCUSABLE) ?? [])];
    requestAnimationFrame(() => (focusables()[0] ?? panelRef.current)?.focus());

    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.();
      if (e.key === 'Tab') {
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-[2px]" onClick={dismissible ? onClose : undefined} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'animate-fade-in relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-lift sm:rounded-xl',
          SIZES[size],
        )}
      >
        {(title || dismissible) && (
          <div className="flex items-start justify-between gap-4 border-b border-sand-200 px-5 py-4 sm:px-6">
            <div>
              {title && <h2 id={titleId} className="text-lg font-semibold">{title}</h2>}
              {description && <p id={descId} className="mt-1 text-sm text-ink-500">{description}</p>}
            </div>
            {dismissible && (
              <button type="button" onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink-400 hover:bg-sand-100 hover:text-ink-900" aria-label="Close dialog">
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-sand-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
