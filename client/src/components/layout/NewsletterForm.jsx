import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import contentService from '../../services/contentService';
import { newsletterSchema } from '../../schemas/contactSchemas';
import { getErrorMessage } from '../../services/api';
import Button from '../common/Button';
import { cn } from '../../utils/format';

export default function NewsletterForm({ dark = false, className }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(newsletterSchema) });

  const mutation = useMutation({
    mutationFn: ({ email }) => contentService.subscribe(email),
    onSuccess: (res) => {
      toast.success(res.message || 'Subscribed!');
      reset();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className={cn('w-full', className)} noValidate>
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : undefined}
          className={cn(
            'field-control h-11 flex-1',
            dark && 'border-white/15 bg-white/10 text-white placeholder:text-white/50 hover:border-white/30 focus:border-white/60',
          )}
          {...register('email')}
        />
        <Button type="submit" loading={mutation.isPending} iconRight={Send}>Subscribe</Button>
      </div>
      {errors.email && <p className={cn('mt-1.5 text-xs font-medium', dark ? 'text-accent-200' : 'text-red-600')} role="alert">{errors.email.message}</p>}
    </form>
  );
}
