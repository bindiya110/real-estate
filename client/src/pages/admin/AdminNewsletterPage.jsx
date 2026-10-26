import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Download, Trash2 } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import AdminToolbar from '../../components/admin/AdminToolbar';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { Badge } from '../../components/common/StatusBadge';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import queryKeys from '../../hooks/queryKeys';
import useUrlParams from '../../hooks/useUrlParams';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatDate } from '../../utils/format';

export default function AdminNewsletterPage() {
  useDocumentTitle('Newsletter');
  const queryClient = useQueryClient();
  const [params, setParams] = useUrlParams();
  const [deleting, setDeleting] = useState(null);

  const query = { q: params.q, page: params.page || 1, limit: 20 };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.subscribers(query), queryFn: () => adminService.subscribers(query), placeholderData: keepPreviousData });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteSubscriber(id),
    onSuccess: (res) => { toast.success(res.message); setDeleting(null); queryClient.invalidateQueries({ queryKey: queryKeys.admin.all }); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const exportCsv = () => {
    const rows = (data?.data ?? []).filter((s) => s.isActive).map((s) => `${s.email},${new Date(s.subscribedAt).toISOString()}`);
    const blob = new Blob([`email,subscribedAt\n${rows.join('\n')}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subscribers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    { key: 'email', header: 'Email', primary: true, render: (s) => <span className="font-medium">{s.email}</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge tone={s.isActive ? 'success' : 'neutral'}>{s.isActive ? 'Subscribed' : 'Unsubscribed'}</Badge> },
    { key: 'subscribedAt', header: 'Subscribed', render: (s) => <span className="text-ink-500">{formatDate(s.subscribedAt)}</span> },
    { key: 'unsubscribedAt', header: 'Unsubscribed', hideOnMobile: true, render: (s) => <span className="text-ink-500">{s.unsubscribedAt ? formatDate(s.unsubscribedAt) : '–'}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (s) => <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(s)} aria-label={`Remove ${s.email}`}><Trash2 className="size-4" /></Button>,
    },
  ];

  return (
    <div>
      <PageTitle
        title="Newsletter subscribers"
        description={`${data?.meta?.active ?? 0} active subscribers`}
        actions={<Button variant="secondary" icon={Download} onClick={exportCsv} disabled={!data?.data?.length}>Export page as CSV</Button>}
      />
      <AdminToolbar search={params.q} onSearch={(q) => setParams({ q })} placeholder="Search by email" />
      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No subscribers yet" />
      <Pagination meta={data?.meta} onPageChange={(page) => setParams({ page })} className="mt-6" />
      <ConfirmationDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting._id)} loading={deleteMutation.isPending} title="Remove subscriber?" message={`${deleting?.email} will be permanently removed from the list.`} confirmLabel="Remove" />
    </div>
  );
}
