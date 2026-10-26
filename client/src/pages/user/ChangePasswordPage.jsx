import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import InputField from '../../components/forms/InputField';
import Button from '../../components/common/Button';
import userService from '../../services/userService';
import { changePasswordSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ChangePasswordPage() {
  useDocumentTitle('Change password');
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const mutation = useMutation({
    mutationFn: ({ currentPassword, newPassword }) => userService.changePassword({ currentPassword, newPassword }),
    onSuccess: (res) => {
      toast.success(res.message || 'Password changed');
      reset();
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title="Change password" description="Use a strong password you don’t use anywhere else." />
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="card space-y-5 p-5 sm:p-6" noValidate>
        <InputField label="Current password" type="password" autoComplete="current-password" required error={errors.currentPassword?.message} {...register('currentPassword')} />
        <InputField label="New password" type="password" autoComplete="new-password" required hint="At least 8 characters with uppercase, lowercase and a number" error={errors.newPassword?.message} {...register('newPassword')} />
        <InputField label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div className="flex items-start gap-2.5 rounded-lg bg-sand-50 p-3 text-xs text-ink-500">
          <ShieldCheck className="size-4 shrink-0 text-emerald-600" aria-hidden />
          Changing your password signs you out on all other devices.
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending}>Update password</Button>
        </div>
      </form>
    </div>
  );
}
