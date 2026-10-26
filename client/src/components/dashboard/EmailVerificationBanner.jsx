import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { MailCheck } from 'lucide-react';
import authService from '../../services/authService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const mutation = useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: (res) => toast.success(res.message || 'Verification email sent'),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!user || user.isEmailVerified) return null;

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
      <div className="flex gap-3">
        <MailCheck className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-amber-900">Please verify your email address</p>
          <p className="text-sm text-amber-800">You need a verified email to submit listings for approval. Check your inbox for the link.</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" loading={mutation.isPending} onClick={() => mutation.mutate()}>
        Resend email
      </Button>
    </div>
  );
}
