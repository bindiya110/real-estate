import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { Badge } from '../../components/common/StatusBadge';
import userService from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { profileSchema } from '../../schemas/authSchemas';
import { applyServerErrors } from '../../utils/forms';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ACCEPTED_IMAGE_TYPES } from '../../constants';
import { formatDate } from '../../utils/format';

export default function ProfilePage() {
  useDocumentTitle('Profile');
  const { user, setUser } = useAuth();
  const fileRef = useRef(null);
  const isAgent = user.role === 'agent';

  const { register, handleSubmit, setError, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name, phone: user.phone ?? '', bio: user.bio ?? '', city: user.city ?? '', agency: user.agency ?? '', designation: user.designation ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (res) => {
      setUser(res.data.user);
      reset(res.data.user ? {
        name: res.data.user.name, phone: res.data.user.phone ?? '', bio: res.data.user.bio ?? '', city: res.data.user.city ?? '', agency: res.data.user.agency ?? '', designation: res.data.user.designation ?? '',
      } : undefined);
      toast.success(res.message || 'Profile updated');
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  const avatarMutation = useMutation({
    mutationFn: userService.uploadAvatar,
    onSuccess: (res) => {
      setUser(res.data.user);
      toast.success(res.message || 'Photo updated');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return toast.error('Please choose a JPEG, PNG or WebP image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be 5 MB or smaller');
    return avatarMutation.mutate(file);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle title="Profile" description="This information may be shown to people you contact." />

      <div className="card mb-6 flex flex-col items-start gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="relative">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <button type="button" onClick={() => fileRef.current?.click()} disabled={avatarMutation.isPending} className="absolute -right-1 -bottom-1 grid size-9 place-items-center rounded-full border-2 border-white bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-60" aria-label="Change profile photo">
            <Camera className="size-4" />
          </button>
          <input ref={fileRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} className="sr-only" onChange={onAvatar} aria-label="Upload profile photo" />
        </div>
        <div>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-sm text-ink-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="dark" className="capitalize">{user.role}</Badge>
            <Badge tone={user.isEmailVerified ? 'success' : 'warning'}>{user.isEmailVerified ? 'Email verified' : 'Email not verified'}</Badge>
            <Badge>Member since {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}</Badge>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="card space-y-5 p-5 sm:p-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Full name" required autoComplete="name" error={errors.name?.message} {...register('name')} />
          <InputField label="Email" value={user.email} disabled hint="Contact support to change your email" readOnly />
          <InputField label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
          <InputField label="City" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
          {isAgent && (
            <>
              <InputField label="Agency" error={errors.agency?.message} {...register('agency')} />
              <InputField label="Designation" placeholder="e.g. Senior Property Consultant" error={errors.designation?.message} {...register('designation')} />
            </>
          )}
        </div>
        <TextAreaField label="Bio" rows={4} placeholder={isAgent ? 'Your experience, areas you cover and specialities' : 'A little about you'} error={errors.bio?.message} {...register('bio')} />
        <div className="flex justify-end">
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
