import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import InputField from '../../components/forms/InputField';
import FormAlert from '../../components/forms/FormAlert';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { resetPasswordSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <div>
        <h1 className="font-display text-3xl font-semibold">Invalid reset link</h1>
        <p className="mt-3 text-ink-500">This password reset link is incomplete or malformed. Please request a new one.</p>
        <Button to="/forgot-password" className="mt-8">Request a new link</Button>
      </div>
    );
  }

  const onSubmit = async ({ password }) => {
    setFormError('');
    try {
      const res = await authService.resetPassword(token, password);
      setUser(null);
      toast.success(res.message || 'Password reset');
      navigate('/login', { replace: true });
    } catch (err) {
      setFormError(applyServerErrors(err, setError, { toastMessage: false }));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Choose a new password</h1>
      <p className="mt-2 text-ink-500">For your security, you’ll be signed out of all other devices.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <FormAlert>{formError}</FormAlert>
        <InputField label="New password" type="password" autoComplete="new-password" required hint="At least 8 characters with uppercase, lowercase and a number" error={errors.password?.message} {...register('password')} />
        <InputField label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Reset password</Button>
      </form>
      <p className="mt-6 text-center text-sm"><Link to="/login" className="link">Back to login</Link></p>
    </div>
  );
}
