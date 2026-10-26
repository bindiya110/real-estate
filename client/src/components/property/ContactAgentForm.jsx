import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CircleCheck, Send } from 'lucide-react';
import inquiryService from '../../services/inquiryService';
import { inquirySchema } from '../../schemas/contactSchemas';
import { useAuth } from '../../context/AuthContext';
import { applyServerErrors } from '../../utils/forms';
import queryKeys from '../../hooks/queryKeys';
import InputField from '../forms/InputField';
import TextAreaField from '../forms/TextAreaField';
import Button from '../common/Button';

/** Sends an inquiry about a property (propertyId) or directly to an agent (agentId). */
export default function ContactAgentForm({ propertyId, agentId, defaultMessage = '', compact = false }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: '', email: '', phone: '', message: defaultMessage },
  });

  useEffect(() => {
    if (user) reset((v) => ({ ...v, name: user.name, email: user.email, phone: user.phone || '' }));
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (values) => inquiryService.create({ ...values, propertyId, agentId }),
    onSuccess: (res) => {
      toast.success(res.message || 'Message sent');
      setSent(true);
      queryClient.invalidateQueries({ queryKey: queryKeys.my.all });
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  if (sent) {
    return (
      <div className="flex flex-col items-center py-6 text-center" role="status">
        <CircleCheck className="size-10 text-emerald-600" aria-hidden />
        <h3 className="mt-3 font-semibold">Message sent</h3>
        <p className="mt-1 text-sm text-ink-500">The agent will get back to you soon{user ? '. You can track it under My inquiries.' : '.'}</p>
        <Button variant="link" className="mt-3" onClick={() => { setSent(false); reset((v) => ({ ...v, message: '' })); }}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-3.5" noValidate>
      <InputField label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
      <div className={compact ? 'space-y-3.5' : 'grid gap-3.5 sm:grid-cols-2'}>
        <InputField label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <InputField label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
      </div>
      <TextAreaField label="Message" rows={4} required error={errors.message?.message} {...register('message')} />
      <Button type="submit" className="w-full" loading={mutation.isPending} iconRight={Send}>
        Send message
      </Button>
      <p className="text-center text-xs text-ink-400">By sending, you agree to be contacted about this property.</p>
    </form>
  );
}
