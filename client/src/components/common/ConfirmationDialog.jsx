import { TriangleAlert } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export default function ConfirmationDialog({
  open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'danger', loading = false, children,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      dismissible={!loading}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      )}
    >
      <div className="flex gap-4">
        <span className={tone === 'danger' ? 'grid size-10 shrink-0 place-items-center rounded-full bg-red-50 text-red-600' : 'grid size-10 shrink-0 place-items-center rounded-full bg-accent-50 text-accent-600'}>
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {message && <p className="mt-1 text-sm leading-relaxed text-ink-500">{message}</p>}
          {children}
        </div>
      </div>
    </Modal>
  );
}
