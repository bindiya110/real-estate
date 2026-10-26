import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import InputField from '../../components/forms/InputField';
import FormAlert from '../../components/forms/FormAlert';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { loginSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setFormError('');
    try {
      const res = await login(values);
      toast.success(res.message || 'Welcome back!');
      const user = res.data.user;
      const from = location.state?.from?.pathname;
      navigate(from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setFormError(applyServerErrors(err, setError, { toastMessage: false }));
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">Welcome back</h1>
      <p className="mt-2 text-ink-500">Log in to manage your listings, favorites and inquiries.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        <FormAlert>{formError}</FormAlert>
        <InputField label="Email" type="email" autoComplete="email" icon={Mail} required error={errors.email?.message} {...register('email')} />
        <div>
          <InputField label="Password" type="password" autoComplete="current-password" icon={Lock} required error={errors.password?.message} {...register('password')} />
          <div className="mt-2 text-right">
            <Link to="/forgot-password" className="link text-sm">Forgot password?</Link>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        New to EstateHub? <Link to="/register" state={location.state} className="link">Create an account</Link>
      </p>

      {import.meta.env.DEV && (
        <div className="mt-8 rounded-lg border border-dashed border-sand-300 bg-sand-100/60 p-4 text-xs text-ink-500">
          <p className="mb-1 font-semibold text-ink-700">Demo accounts (development only)</p>
          <p>Admin: admin@estatehub.dev / Admin@12345</p>
          <p>Agent: arjun@estatehub.dev / Agent@12345</p>
          <p>User: user@estatehub.dev / User@12345</p>
        </div>
      )}
    </div>
  );
}
