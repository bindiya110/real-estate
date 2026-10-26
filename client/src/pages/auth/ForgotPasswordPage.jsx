import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, MailCheck } from 'lucide-react';
import InputField from '../../components/forms/InputField';
import FormAlert from '../../components/forms/FormAlert';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import { forgotPasswordSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async ({ email }) => {
    setFormError('');
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setFormError(applyServerErrors(err, setError, { toastMessage: false }));
    }
  };

  if (message) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><MailCheck className="size-7" aria-hidden /></span>
        <h1 className="font-display mt-5 text-3xl font-semibold">Check your inbox</h1>
        <p className="mt-3 text-ink-500">{message} The link expires in 30 minutes.</p>
        <Button to="/login" variant="secondary" icon={ArrowLeft} className="mt-8">Back to login</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Forgot your password?</h1>
      <p className="mt-2 text-ink-500">Enter the email you signed up with and we’ll send you a reset link.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <FormAlert>{formError}</FormAlert>
        <InputField label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Send reset link</Button>
      </form>
      <p className="mt-6 text-center text-sm"><Link to="/login" className="link">Back to login</Link></p>
    </div>
  );
}
