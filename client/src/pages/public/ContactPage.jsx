import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CircleCheck, Clock, Mail, MapPin, Phone } from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';
import contentService from '../../services/contentService';
import { contactSchema } from '../../schemas/contactSchemas';
import { applyServerErrors } from '../../utils/forms';
import { useAuth } from '../../context/AuthContext';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function ContactPage() {
  useDocumentTitle('Contact us');
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const { data } = useQuery({ queryKey: queryKeys.content.settings, queryFn: contentService.settings, staleTime: 10 * 60_000 });
  const settings = data?.data;

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  useEffect(() => {
    if (user) reset((v) => ({ ...v, name: user.name, email: user.email, phone: user.phone || '' }));
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: contentService.contact,
    onSuccess: () => {
      setSent(true);
      reset();
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  const details = [
    settings?.address && { icon: MapPin, label: 'Office', value: settings.address },
    settings?.contactPhone && { icon: Phone, label: 'Phone', value: settings.contactPhone, href: `tel:${settings.contactPhone.replace(/\s/g, '')}` },
    settings?.contactEmail && { icon: Mail, label: 'Email', value: settings.contactEmail, href: `mailto:${settings.contactEmail}` },
    { icon: Clock, label: 'Hours', value: 'Mon-Sat, 9:30 am - 7:00 pm' },
  ].filter(Boolean);

  return (
    <>
      <PageHeader title="Contact us" description="Questions about a listing, partnerships or your account? We usually reply within one business day." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <Container className="grid gap-10 py-12 sm:py-16 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold">Get in touch</h2>
          <ul className="mt-6 space-y-5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <li key={label} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600"><Icon className="size-5" aria-hidden /></span>
                <div>
                  <p className="text-sm text-ink-400">{label}</p>
                  {href ? <a href={href} className="font-medium hover:text-accent-600">{value}</a> : <p className="font-medium">{value}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6 sm:p-8 lg:col-span-3">
          {sent ? (
            <div className="flex flex-col items-center py-10 text-center" role="status">
              <CircleCheck className="size-12 text-emerald-600" aria-hidden />
              <h2 className="mt-4 text-xl font-semibold">Thanks for reaching out</h2>
              <p className="mt-2 text-ink-500">Our team has received your message and will get back to you shortly.</p>
              <Button variant="secondary" className="mt-6" onClick={() => setSent(false)}>Send another message</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
                <InputField label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                <InputField label="Subject" required error={errors.subject?.message} {...register('subject')} />
              </div>
              <TextAreaField label="Message" rows={6} required error={errors.message?.message} {...register('message')} />
              <Button type="submit" size="lg" loading={mutation.isPending}>Send message</Button>
            </form>
          )}
        </div>
      </Container>
    </>
  );
}
