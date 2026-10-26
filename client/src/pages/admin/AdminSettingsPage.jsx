import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import PageTitle from '../../components/dashboard/PageTitle';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';
import Button from '../../components/common/Button';
import { ErrorState, PageLoader } from '../../components/common/States';
import adminService from '../../services/adminService';
import { settingsSchema } from '../../schemas/adminSchemas';
import { applyServerErrors } from '../../utils/forms';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { sizedImage } from '../../utils/format';

const toForm = (s) => ({
  siteName: s.siteName ?? '',
  tagline: s.tagline ?? '',
  heroTitle: s.heroTitle ?? '',
  heroSubtitle: s.heroSubtitle ?? '',
  heroImage: s.heroImage ?? '',
  contactEmail: s.contactEmail ?? '',
  contactPhone: s.contactPhone ?? '',
  address: s.address ?? '',
  socialLinks: {
    facebook: s.socialLinks?.facebook ?? '',
    instagram: s.socialLinks?.instagram ?? '',
    linkedin: s.socialLinks?.linkedin ?? '',
    twitter: s.socialLinks?.twitter ?? '',
  },
});

function Section({ title, description, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

export default function AdminSettingsPage() {
  useDocumentTitle('Site settings');
  const queryClient = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.settings, queryFn: adminService.settings });
  const { register, handleSubmit, reset, watch, setError, formState: { errors, isDirty } } = useForm({ resolver: zodResolver(settingsSchema) });

  useEffect(() => {
    if (data?.data) reset(toForm(data.data));
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: adminService.updateSettings,
    onSuccess: (res) => {
      toast.success(res.message);
      reset(toForm(res.data));
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.settings });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.settings });
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const heroImage = watch('heroImage');

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="mx-auto max-w-3xl space-y-6" noValidate>
      <PageTitle title="Site settings" description="Branding, homepage hero and contact details shown across the website." />

      <Section title="General">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Site name" required error={errors.siteName?.message} {...register('siteName')} />
          <InputField label="Tagline" error={errors.tagline?.message} {...register('tagline')} />
        </div>
      </Section>

      <Section title="Homepage hero" description="The first thing visitors see.">
        <InputField label="Headline" error={errors.heroTitle?.message} {...register('heroTitle')} />
        <TextAreaField label="Subtitle" rows={3} error={errors.heroSubtitle?.message} {...register('heroSubtitle')} />
        <InputField label="Background image URL" error={errors.heroImage?.message} {...register('heroImage')} />
        {heroImage && /^https?:\/\//.test(heroImage) && <img src={sizedImage(heroImage, 800)} alt="Hero preview" className="aspect-[3/1] w-full rounded-lg object-cover" />}
      </Section>

      <Section title="Contact details">
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Contact email" type="email" required error={errors.contactEmail?.message} {...register('contactEmail')} />
          <InputField label="Contact phone" error={errors.contactPhone?.message} {...register('contactPhone')} />
        </div>
        <InputField label="Office address" error={errors.address?.message} {...register('address')} />
      </Section>

      <Section title="Social links" description="Leave empty to hide an icon in the footer.">
        <div className="grid gap-4 sm:grid-cols-2">
          {['facebook', 'instagram', 'linkedin', 'twitter'].map((name) => (
            <InputField key={name} label={name === 'twitter' ? 'X (Twitter)' : name[0].toUpperCase() + name.slice(1)} placeholder="https://…" error={errors.socialLinks?.[name]?.message} {...register(`socialLinks.${name}`)} />
          ))}
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end">
        <Button type="submit" size="lg" loading={mutation.isPending} disabled={!isDirty} className="shadow-lift">Save settings</Button>
      </div>
    </form>
  );
}
