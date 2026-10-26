import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import InputField from '../../components/forms/InputField';
import FormAlert from '../../components/forms/FormAlert';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { registerSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function RegisterPage() {
  useDocumentTitle('Create account');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '', acceptTerms: false },
  });

  const onSubmit = async ({ confirmPassword, acceptTerms, ...values }) => {
    setFormError('');
    try {
      const res = await registerUser(values);
      toast.success(res.message || 'Account created', { duration: 6000 });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setFormError(applyServerErrors(err, setError, { toastMessage: false }));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Create your account</h1>
      <p className="mt-2 text-ink-500">Save homes, contact agents and list your property for free.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <FormAlert>{formError}</FormAlert>
        <InputField label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
        <InputField label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <InputField label="Phone" type="tel" autoComplete="tel" hint="Optional" error={errors.phone?.message} {...register('phone')} />
        <InputField label="Password" type="password" autoComplete="new-password" required hint="At least 8 characters with uppercase, lowercase and a number" error={errors.password?.message} {...register('password')} />
        <InputField label="Confirm password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div>
          <label className="flex items-start gap-2.5 text-sm text-ink-600">
            <input type="checkbox" className="mt-0.5 size-4 rounded border-sand-300 accent-accent-500" aria-invalid={errors.acceptTerms ? 'true' : undefined} {...register('acceptTerms')} />
            <span>I agree to the <Link to="/terms" className="link" target="_blank">Terms</Link> and <Link to="/privacy" className="link" target="_blank">Privacy policy</Link></span>
          </label>
          {errors.acceptTerms && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{errors.acceptTerms.message}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account? <Link to="/login" state={location.state} className="link">Log in</Link>
      </p>
    </div>
  );
}
