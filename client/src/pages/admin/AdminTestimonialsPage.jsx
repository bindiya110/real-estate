import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, Plus, Star, Trash2 } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Avatar from '../../components/common/Avatar';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import InputField from '../../components/forms/InputField';
import SelectField from '../../components/forms/SelectField';
import TextAreaField from '../../components/forms/TextAreaField';
import Toggle from '../../components/forms/Toggle';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { testimonialSchema } from '../../schemas/adminSchemas';
import { applyServerErrors } from '../../utils/forms';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { cn } from '../../utils/format';

const EMPTY = { name: '', role: '', content: '', avatar: '', rating: 5, isPublished: true };

function TestimonialDialog({ item, open, onClose }) {
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(testimonialSchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(item ? { name: item.name, role: item.role ?? '', content: item.content, avatar: item.avatar ?? '', rating: item.rating, isPublished: item.isPublished } : EMPTY);
  }, [open, item, reset]);

  const mutation = useMutation({
    mutationFn: (values) => (item ? adminService.updateTestimonial(item._id, values) : adminService.createTestimonial(values)),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.testimonials });
      onClose();
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Edit testimonial' : 'New testimonial'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={mutation.isPending} onClick={handleSubmit((v) => mutation.mutate(v))}>Save</Button></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <InputField label="Name" required error={errors.name?.message} {...register('name')} />
          <InputField label="Role / designation" placeholder="e.g. Bought a home in Pune" error={errors.role?.message} {...register('role')} />
        </div>
        <TextAreaField label="Testimonial" required rows={4} error={errors.content?.message} {...register('content')} />
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <InputField label="Avatar URL" placeholder="https://…" error={errors.avatar?.message} {...register('avatar')} />
          <SelectField label="Rating" options={[5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} ★` }))} {...register('rating')} />
        </div>
        <Controller control={control} name="isPublished" render={({ field }) => <Toggle label="Published" description="Shown on the homepage" checked={field.value} onChange={field.onChange} />} />
      </form>
    </Modal>
  );
}

export default function AdminTestimonialsPage() {
  useDocumentTitle('Testimonials');
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(undefined);
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.testimonials, queryFn: adminService.testimonials });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.testimonials });
    queryClient.invalidateQueries({ queryKey: queryKeys.content.testimonials });
  };

  const toggleMutation = useMutation({
    mutationFn: (t) => adminService.updateTestimonial(t._id, { isPublished: !t.isPublished }),
    onSuccess: (res) => { toast.success(res.data.isPublished ? 'Published' : 'Unpublished'); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteTestimonial(id),
    onSuccess: (res) => { toast.success(res.message); setDeleting(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns = [
    {
      key: 'name',
      header: 'Customer',
      primary: true,
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar src={t.avatar} name={t.name} size="sm" />
          <div className="min-w-0">
            <p className="font-medium">{t.name}</p>
            <p className="truncate text-xs text-ink-400">{t.role}</p>
          </div>
        </div>
      ),
    },
    { key: 'content', header: 'Testimonial', hideOnMobile: true, render: (t) => <p className="line-clamp-2 max-w-md text-sm text-ink-600">{t.content}</p> },
    {
      key: 'rating',
      header: 'Rating',
      render: (t) => (
        <span className="flex gap-0.5" aria-label={`${t.rating} out of 5`}>
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className={cn('size-3.5', i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-sand-300')} aria-hidden />)}
        </span>
      ),
    },
    { key: 'isPublished', header: 'Published', render: (t) => <Toggle label={<span className="sr-only">Published</span>} checked={t.isPublished} onChange={() => toggleMutation.mutate(t)} /> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (t) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(t)} aria-label={`Edit testimonial from ${t.name}`}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(t)} aria-label={`Delete testimonial from ${t.name}`}><Trash2 className="size-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="Testimonials" description="Customer stories shown on the homepage." actions={<Button icon={Plus} onClick={() => setEditing(null)}>New testimonial</Button>} />
      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No testimonials yet" />
      <TestimonialDialog open={editing !== undefined} item={editing} onClose={() => setEditing(undefined)} />
      <ConfirmationDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting._id)} loading={deleteMutation.isPending} title="Delete this testimonial?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
