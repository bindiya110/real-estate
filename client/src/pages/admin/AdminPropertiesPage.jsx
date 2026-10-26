import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, Eye, Pencil, Star, Trash2, X } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import AdminToolbar, { FilterSelect } from '../../components/admin/AdminToolbar';
import RejectDialog from '../../components/admin/RejectDialog';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import queryKeys from '../../hooks/queryKeys';
import useUrlParams from '../../hooks/useUrlParams';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { LISTING_TYPES } from '../../constants';
import { cn, formatDate, formatListingPrice, sizedImage } from '../../utils/format';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Drafts' },
];

export default function AdminPropertiesPage() {
  useDocumentTitle('Manage properties');
  const queryClient = useQueryClient();
  const [params, setParams] = useUrlParams();
  const [rejecting, setRejecting] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const query = { q: params.q, status: params.status, listingType: params.listingType, sort: params.sort, page: params.page || 1, limit: 15 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.admin.properties(query),
    queryFn: () => adminService.properties(query),
    placeholderData: keepPreviousData,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
  };

  const action = useMutation({
    mutationFn: ({ type, property, payload }) => {
      if (type === 'approve') return adminService.approve(property._id);
      if (type === 'reject') return adminService.reject(property._id, payload);
      if (type === 'feature') return adminService.feature(property._id, payload);
      return adminService.deleteProperty(property._id);
    },
    onSuccess: (res, { type }) => {
      toast.success(res.message);
      if (type === 'reject') setRejecting(null);
      if (type === 'delete') setDeleting(null);
      refresh();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const busy = (p, type) => action.isPending && action.variables?.property._id === p._id && action.variables?.type === type;

  const columns = [
    {
      key: 'title',
      header: 'Property',
      primary: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={sizedImage(p.images?.[0]?.url, 160)} alt="" className="size-12 shrink-0 rounded-lg bg-sand-200 object-cover" />
          <div className="min-w-0">
            <p className="max-w-[18rem] truncate font-medium">{p.title}</p>
            <p className="text-xs text-ink-400">{p.city} · {p.listingType === 'rent' ? 'Rent' : 'Sale'} · {p.category?.name ?? 'Uncategorised'}</p>
          </div>
        </div>
      ),
    },
    { key: 'owner', header: 'Owner', hideOnMobile: true, className: 'hidden xl:table-cell', render: (p) => <div className="text-sm"><p>{p.owner?.name}</p><p className="text-xs text-ink-400">{p.owner?.email}</p></div> },
    { key: 'price', header: 'Price', render: (p) => <span className="font-medium whitespace-nowrap">{formatListingPrice(p)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'featured',
      header: 'Featured',
      render: (p) => (
        <button
          type="button"
          onClick={() => action.mutate({ type: 'feature', property: p, payload: !p.featured })}
          disabled={p.status !== 'approved' || busy(p, 'feature')}
          className="rounded-md p-1.5 hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-40"
          aria-pressed={p.featured}
          aria-label={p.featured ? `Unfeature ${p.title}` : `Feature ${p.title}`}
          title={p.status !== 'approved' ? 'Only approved listings can be featured' : p.featured ? 'Unfeature' : 'Feature on homepage'}
        >
          <Star className={cn('size-4.5', p.featured ? 'fill-amber-400 text-amber-500' : 'text-ink-300')} />
        </button>
      ),
    },
    { key: 'createdAt', header: 'Created', hideOnMobile: true, className: 'hidden 2xl:table-cell', render: (p) => <span className="whitespace-nowrap text-ink-500">{formatDate(p.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-0.5">
          {p.status !== 'approved' && (
            <Button size="icon" variant="ghost" className="text-emerald-700 hover:bg-emerald-50" loading={busy(p, 'approve')} onClick={() => action.mutate({ type: 'approve', property: p })} aria-label={`Approve ${p.title}`} title="Approve">{!busy(p, 'approve') && <Check className="size-4" />}</Button>
          )}
          {p.status !== 'rejected' && (
            <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => setRejecting(p)} aria-label={`Reject ${p.title}`} title="Reject"><X className="size-4" /></Button>
          )}
          <Button to={`/properties/${p.slug}`} variant="ghost" size="icon" aria-label={`View ${p.title}`} title="View" target="_blank"><Eye className="size-4" /></Button>
          <Button to={`/admin/properties/${p._id}/edit`} variant="ghost" size="icon" aria-label={`Edit ${p.title}`} title="Edit"><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(p)} aria-label={`Delete ${p.title}`} title="Delete"><Trash2 className="size-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="Properties" description="Review, approve and manage every listing on the platform." />

      <div role="tablist" aria-label="Status" className="scrollbar-none mb-5 flex gap-1 overflow-x-auto border-b border-sand-200">
        {STATUS_TABS.map((t) => (
          <button key={t.value} role="tab" type="button" aria-selected={(params.status ?? '') === t.value} onClick={() => setParams({ status: t.value })} className={cn('-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap', (params.status ?? '') === t.value ? 'border-accent-500 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-800')}>
            {t.label}
          </button>
        ))}
      </div>

      <AdminToolbar search={params.q} onSearch={(q) => setParams({ q })} placeholder="Search by title, city or slug">
        <FilterSelect label="Type" value={params.listingType} onChange={(listingType) => setParams({ listingType })} options={LISTING_TYPES} />
        <FilterSelect label="Sort" value={params.sort} onChange={(sort) => setParams({ sort })} options={[{ value: 'oldest', label: 'Oldest first' }, { value: 'price_desc', label: 'Highest price' }, { value: 'price_asc', label: 'Lowest price' }]} />
      </AdminToolbar>

      <p className="mb-3 text-sm text-ink-500">{data?.meta?.total ?? 0} listings</p>
      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No listings match these filters" />
      <Pagination meta={data?.meta} onPageChange={(page) => setParams({ page })} className="mt-6" />

      <RejectDialog property={rejecting} onClose={() => setRejecting(null)} loading={action.isPending && action.variables?.type === 'reject'} onSubmit={(reason) => action.mutate({ type: 'reject', property: rejecting, payload: reason })} />
      <ConfirmationDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => action.mutate({ type: 'delete', property: deleting })}
        loading={action.isPending && action.variables?.type === 'delete'}
        title="Delete this listing?"
        message={`“${deleting?.title}” will be permanently removed along with its photos, favorites and links from inquiries.`}
        confirmLabel="Delete permanently"
      />
    </div>
  );
}
