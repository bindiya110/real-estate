import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, CircleX } from 'lucide-react';
import Button from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/States';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function VerifyEmailPage() {
  useDocumentTitle('Verify email');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const started = useRef(false);

  const mutation = useMutation({
    mutationFn: () => authService.verifyEmail(token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.me }),
  });

  useEffect(() => {
    // Tokens are single-use, so guard against StrictMode's double effect run.
    if (started.current || !token) return;
    started.current = true;
    mutation.mutate();
  }, [token, mutation]);

  if (!token || mutation.isError) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-600"><CircleX className="size-7" aria-hidden /></span>
        <h1 className="font-display mt-5 text-3xl font-semibold">Verification failed</h1>
        <p className="mt-3 text-ink-500">{token ? getErrorMessage(mutation.error) : 'The verification link is missing its token.'}</p>
        <p className="mt-2 text-sm text-ink-400">You can request a new link from your dashboard.</p>
        <Button to={user ? '/dashboard' : '/login'} className="mt-8">{user ? 'Go to dashboard' : 'Log in'}</Button>
      </div>
    );
  }

  if (mutation.isSuccess) {
    return (
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CircleCheck className="size-7" aria-hidden /></span>
        <h1 className="font-display mt-5 text-3xl font-semibold">Email verified</h1>
        <p className="mt-3 text-ink-500">Thanks! Your email address is confirmed. You can now submit listings for approval.</p>
        <Button to={user ? '/dashboard' : '/login'} className="mt-8">{user ? 'Go to dashboard' : 'Log in'}</Button>
      </div>
    );
  }

  return <LoadingSpinner size="lg" label="Verifying your email" className="py-20" />;
}
