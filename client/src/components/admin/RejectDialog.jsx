import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../common/Modal';
import Button from '../common/Button';
import TextAreaField from '../forms/TextAreaField';
import { rejectSchema } from '../../schemas/adminSchemas';

const QUICK_REASONS = [
  'Photos are stock images or do not match the property.',
  'Price looks incorrect. Please confirm the asking price.',
  'Missing key details such as address or area.',
  'Duplicate listing.',
];

export default function RejectDialog({ property, onClose, onSubmit, loading }) {
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({ resolver: zodResolver(rejectSchema), defaultValues: { reason: '' } });

  useEffect(() => {
    if (property) reset({ reason: '' });
  }, [property, reset]);

  return (
    <Modal
      open={Boolean(property)}
      onClose={onClose}
      title="Reject listing"
      description={property?.title}
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="danger" loading={loading} onClick={handleSubmit((v) => onSubmit(v.reason))}>Reject listing</Button>
        </>
      )}
    >
      <p className="mb-4 text-sm text-ink-500">The owner will see this reason in their dashboard and can update the listing.</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_REASONS.map((r) => (
          <button key={r} type="button" onClick={() => setValue('reason', r, { shouldValidate: true })} className="rounded-full border border-sand-300 px-3 py-1 text-left text-xs hover:bg-sand-50">
            {r}
          </button>
        ))}
      </div>
      <TextAreaField label="Reason" required rows={4} error={errors.reason?.message} {...register('reason')} />
    </Modal>
  );
}
