import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CirclePlus, Eye, Pencil, Trash2 } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import userService from '../../services/userService';
import propertyService from '../../services/propertyService';
import { getErrorMessage } from '../../services/api';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { cn, formatDate, formatListingPrice, sizedImage } from '../../utils/format';

const TABS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Drafts' },
  { value: 'rejected', label: 'Rejected' },
];

export default function MyPropertiesPage() {
  useDocumentTitle('My properties');
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const page = Number(searchParams.get('page')) || 1;
  const [toDelete, setToDelete] = useState(null);

  const params = { status: status || undefined, page, limit: 10 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.my.properties(params),
    queryFn: () => userService.myProperties(params),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertyService.remove(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Listing deleted');
      setToDelete(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.my.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns = [
    {
      key: 'title',
      header: 'Property',
      primary: true,
      render: (p) => (
        <div className="flex items-center gap-3">
          <img src={sizedImage(p.images?.[0]?.url, 160)} alt="" className="size-14 shrink-0 rounded-lg bg-sand-200 object-cover" />
          <div className="min-w-0">
            <p className="max-w-xs truncate font-medium">{p.title}</p>
            <p className="text-xs text-ink-400">{p.city} · {p.listingType === 'rent' ? 'For rent' : 'For sale'}</p>
            {p.status === 'rejected' && p.rejectionReason && <p className="mt-1 max-w-xs text-xs text-red-600">Reason: {p.rejectionReason}</p>}
          </div>
        </div>
      ),
    },
    { key: 'price', header: 'Price', render: (p) => <span className="font-medium whitespace-nowrap">{formatListingPrice(p)}</span> },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    { key: 'views', header: 'Views', hideOnMobile: true, render: (p) => p.views ?? 0 },
    { key: 'updatedAt', header: 'Updated', hideOnMobile: true, render: (p) => <span className="whitespace-nowrap text-ink-500">{formatDate(p.updatedAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <Button to={`/properties/${p.slug}`} variant="ghost" size="icon" aria-label={`Preview ${p.title}`} title="Preview"><Eye className="size-4" /></Button>
          <Button to={`/dashboard/properties/${p._id}/edit`} variant="ghost" size="icon" aria-label={`Edit ${p.title}`} title="Edit"><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`} title="Delete"><Trash2 className="size-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="My properties" description="Create, edit and track the status of your listings." actions={<Button to="/dashboard/properties/new" icon={CirclePlus}>Add listing</Button>} />

      <div role="tablist" aria-label="Filter by status" className="scrollbar-none mb-5 flex gap-1 overflow-x-auto border-b border-sand-200">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={status === tab.value}
            onClick={() => setSearchParams(tab.value ? { status: tab.value } : {})}
            className={cn('-mb-px border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap', status === tab.value ? 'border-accent-500 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-800')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={data?.data}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle={status ? `No ${status} listings` : 'You have no listings yet'}
        emptyDescription="Listings you create will appear here with their review status."
        emptyAction={<Button to="/dashboard/properties/new" size="sm">Create a listing</Button>}
      />
      <Pagination meta={data?.meta} onPageChange={(p) => setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', p); return n; })} className="mt-6" />

      <p className="mt-6 text-xs text-ink-400">Tip: editing an approved listing sends it back for a quick review. <Link to="/faq" className="link">Learn more</Link></p>

      <ConfirmationDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={() => deleteMutation.mutate(toDelete._id)}
        loading={deleteMutation.isPending}
        title="Delete this listing?"
        message={`“${toDelete?.title}” and its photos will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete listing"
      />
    </div>
  );
}
