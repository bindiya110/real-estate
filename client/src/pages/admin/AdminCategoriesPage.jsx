import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { Badge } from '../../components/common/StatusBadge';
import InputField from '../../components/forms/InputField';
import TextAreaField from '../../components/forms/TextAreaField';
import Toggle from '../../components/forms/Toggle';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { categorySchema } from '../../schemas/adminSchemas';
import { applyServerErrors } from '../../utils/forms';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { sizedImage } from '../../utils/format';

const EMPTY = { name: '', description: '', image: '', isActive: true };

function CategoryDialog({ category, open, onClose }) {
  const queryClient = useQueryClient();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm({ resolver: zodResolver(categorySchema), defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(category ? { name: category.name, description: category.description ?? '', image: category.image ?? '', isActive: category.isActive } : EMPTY);
  }, [open, category, reset]);

  const mutation = useMutation({
    mutationFn: (values) => (category ? adminService.updateCategory(category._id, values) : adminService.createCategory(values)),
    onSuccess: (res) => {
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.categories });
      onClose();
    },
    onError: (err) => applyServerErrors(err, setError),
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? 'Edit category' : 'New category'}
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={mutation.isPending} onClick={handleSubmit((v) => mutation.mutate(v))}>Save</Button></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit((v) => mutation.mutate(v))} noValidate>
        <InputField label="Name" required error={errors.name?.message} {...register('name')} />
        <TextAreaField label="Description" rows={3} error={errors.description?.message} {...register('description')} />
        <InputField label="Image URL" placeholder="https://…" error={errors.image?.message} {...register('image')} />
        <Controller control={control} name="isActive" render={({ field }) => <Toggle label="Active" description="Inactive categories are hidden from the site and listing form" checked={field.value} onChange={field.onChange} />} />
      </form>
    </Modal>
  );
}

export default function AdminCategoriesPage() {
  useDocumentTitle('Categories');
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new
  const [deleting, setDeleting] = useState(null);
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.categories, queryFn: adminService.categories });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteCategory(id),
    onSuccess: (res) => {
      toast.success(res.message);
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.content.categories });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setDeleting(null);
    },
  });

  const columns = [
    {
      key: 'name',
      header: 'Category',
      primary: true,
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.image ? <img src={sizedImage(c.image, 160)} alt="" className="size-12 rounded-lg object-cover" /> : <span className="size-12 rounded-lg bg-sand-200" />}
          <div>
            <p className="font-medium">{c.name}</p>
            <p className="line-clamp-1 max-w-sm text-xs text-ink-400">{c.description}</p>
          </div>
        </div>
      ),
    },
    { key: 'slug', header: 'Slug', hideOnMobile: true, render: (c) => <code className="text-xs text-ink-500">{c.slug}</code> },
    { key: 'count', header: 'Listings', render: (c) => c.propertyCount },
    { key: 'isActive', header: 'Status', render: (c) => <Badge tone={c.isActive ? 'success' : 'neutral'}>{c.isActive ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(c)} aria-label={`Delete ${c.name}`}><Trash2 className="size-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="Categories" description="Group listings into categories shown on the homepage and in filters." actions={<Button icon={Plus} onClick={() => setEditing(null)}>New category</Button>} />
      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No categories yet" />
      <CategoryDialog open={editing !== undefined} category={editing} onClose={() => setEditing(undefined)} />
      <ConfirmationDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleteMutation.mutate(deleting._id)}
        loading={deleteMutation.isPending}
        title={`Delete “${deleting?.name}”?`}
        message={deleting?.propertyCount ? 'This category is used by listings and cannot be deleted. Deactivate it instead.' : 'This cannot be undone.'}
        confirmLabel="Delete"
      />
    </div>
  );
}
