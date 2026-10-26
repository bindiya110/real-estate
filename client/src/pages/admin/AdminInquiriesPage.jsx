import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Eye, Trash2 } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import AdminToolbar, { FilterSelect } from '../../components/admin/AdminToolbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import queryKeys from '../../hooks/queryKeys';
import useUrlParams from '../../hooks/useUrlParams';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { INQUIRY_STATUS } from '../../constants';
import { cn, formatDate } from '../../utils/format';

const INQUIRY_OPTIONS = Object.entries(INQUIRY_STATUS).map(([value, { label }]) => ({ value, label }));
const MESSAGE_OPTIONS = [{ value: 'new', label: 'New' }, { value: 'in-progress', label: 'In progress' }, { value: 'resolved', label: 'Resolved' }];

function StatusSelect({ value, options, onChange, label }) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 rounded-md border border-sand-300 bg-white px-2 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export default function AdminInquiriesPage() {
  useDocumentTitle('Inquiries & messages');
  const queryClient = useQueryClient();
  const [params, setParams] = useUrlParams();
  const tab = params.tab === 'messages' ? 'messages' : 'inquiries';
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const query = { q: params.q, status: params.status, page: params.page || 1, limit: 15 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: tab === 'messages' ? queryKeys.admin.messages(query) : queryKeys.admin.inquiries(query),
    queryFn: () => (tab === 'messages' ? adminService.messages(query) : adminService.inquiries(query)),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => (tab === 'messages' ? adminService.updateMessageStatus(id, status) : adminService.updateInquiryStatus(id, status)),
    onSuccess: (res) => { toast.success(res.message); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => (tab === 'messages' ? adminService.deleteMessage(id) : adminService.deleteInquiry(id)),
    onSuccess: (res) => { toast.success(res.message); setDeleting(null); invalidate(); },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const options = tab === 'messages' ? MESSAGE_OPTIONS : INQUIRY_OPTIONS;

  const columns = [
    {
      key: 'from',
      header: 'From',
      primary: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{r.name}</p>
          <p className="truncate text-xs text-ink-400">{r.email}</p>
        </div>
      ),
    },
    tab === 'messages'
      ? { key: 'subject', header: 'Subject', render: (r) => <span className="line-clamp-1 max-w-xs">{r.subject}</span> }
      : {
        key: 'about',
        header: 'About',
        render: (r) => (
          <div className="max-w-xs text-sm">
            {r.property ? <Link to={`/properties/${r.property.slug}`} className="line-clamp-1 hover:text-accent-600">{r.property.title}</Link> : <span className="text-ink-400">Direct to agent</span>}
            <p className="text-xs text-ink-400">To {r.recipient?.name}</p>
          </div>
        ),
      },
    { key: 'status', header: 'Status', render: (r) => <StatusSelect label={`Status for ${r.name}`} value={r.status} options={options} onChange={(status) => statusMutation.mutate({ id: r._id, status })} /> },
    { key: 'date', header: 'Received', hideOnMobile: true, render: (r) => <span className="whitespace-nowrap text-ink-500">{formatDate(r.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewing(r)} aria-label={`Read message from ${r.name}`}><Eye className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setDeleting(r)} aria-label={`Delete message from ${r.name}`}><Trash2 className="size-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageTitle title="Inquiries & messages" description="Property inquiries between users and agents, and messages sent through the contact form." />

      <div role="tablist" className="mb-5 inline-flex rounded-lg border border-sand-300 bg-white p-1">
        {[['inquiries', 'Property inquiries'], ['messages', 'Contact messages']].map(([value, label]) => (
          <button key={value} role="tab" type="button" aria-selected={tab === value} onClick={() => setParams({ tab: value === 'inquiries' ? undefined : value, status: undefined, q: undefined })} className={cn('rounded-md px-4 py-1.5 text-sm font-medium', tab === value ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900')}>
            {label}
          </button>
        ))}
      </div>

      <AdminToolbar search={params.q} onSearch={(q) => setParams({ q })} placeholder="Search by name, email or message">
        <FilterSelect label="Status" value={params.status} onChange={(status) => setParams({ status })} options={options} />
      </AdminToolbar>

      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="Nothing here yet" />
      <Pagination meta={data?.meta} onPageChange={(page) => setParams({ page })} className="mt-6" />

      <Modal open={Boolean(viewing)} onClose={() => setViewing(null)} title={viewing?.subject || 'Inquiry'} size="lg">
        {viewing && (
          <div className="space-y-4">
            <div className="text-sm">
              <p className="font-semibold">{viewing.name}</p>
              <p className="text-ink-500">{viewing.email}{viewing.phone && ` · ${viewing.phone}`}</p>
              <p className="text-xs text-ink-400">{formatDate(viewing.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            {viewing.property && <p className="text-sm">Property: <Link to={`/properties/${viewing.property.slug}`} className="link">{viewing.property.title}</Link></p>}
            <p className="rounded-lg bg-sand-50 p-4 text-sm leading-relaxed whitespace-pre-line text-ink-700">{viewing.message}</p>
            <Button href={`mailto:${viewing.email}`} size="sm">Reply by email</Button>
          </div>
        )}
      </Modal>

      <ConfirmationDialog open={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={() => deleteMutation.mutate(deleting._id)} loading={deleteMutation.isPending} title="Delete this message?" message="This cannot be undone." confirmLabel="Delete" />
    </div>
  );
}
