import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Ban, Eye, UserCheck } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import DataTable from '../../components/dashboard/DataTable';
import AdminToolbar, { FilterSelect } from '../../components/admin/AdminToolbar';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Modal from '../../components/common/Modal';
import StatusBadge, { Badge } from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { LoadingSpinner } from '../../components/common/States';
import adminService from '../../services/adminService';
import { getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import queryKeys from '../../hooks/queryKeys';
import useUrlParams from '../../hooks/useUrlParams';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { ROLES } from '../../constants';
import { formatDate, formatListingPrice } from '../../utils/format';

function UserDetails({ userId, onClose }) {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.admin.user(userId), queryFn: () => adminService.user(userId), enabled: Boolean(userId) });
  const details = data?.data;

  return (
    <Modal open={Boolean(userId)} onClose={onClose} title="User profile" size="lg">
      {isLoading || !details ? <LoadingSpinner className="py-10" /> : (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar src={details.user.avatar} name={details.user.name} size="lg" />
            <div>
              <p className="text-lg font-semibold">{details.user.name}</p>
              <p className="text-sm text-ink-500">{details.user.email}{details.user.phone && ` · ${details.user.phone}`}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone="dark" className="capitalize">{details.user.role}</Badge>
                <StatusBadge status={details.user.isActive ? 'active' : 'suspended'} />
                <Badge tone={details.user.isEmailVerified ? 'success' : 'warning'}>{details.user.isEmailVerified ? 'Verified' : 'Unverified'}</Badge>
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-3 gap-3 text-center">
            {[['Listings', details.properties.length], ['Inquiries sent', details.inquiriesSent], ['Inquiries received', details.inquiriesReceived]].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-sand-50 p-3"><dd className="text-xl font-semibold">{v}</dd><dt className="text-xs text-ink-400">{l}</dt></div>
            ))}
          </dl>
          <p className="text-xs text-ink-400">Joined {formatDate(details.user.createdAt)}{details.user.lastLoginAt && ` · Last login ${formatDate(details.user.lastLoginAt)}`}</p>
          {details.properties.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold">Listings</h3>
              <ul className="divide-y divide-sand-200 rounded-lg border border-sand-200">
                {details.properties.map((p) => (
                  <li key={p._id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <Link to={`/properties/${p.slug}`} className="truncate hover:text-accent-600">{p.title}</Link>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-ink-500">{formatListingPrice(p)} <StatusBadge status={p.status} /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function AdminUsersPage() {
  useDocumentTitle('Manage users');
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useUrlParams();
  const [viewing, setViewing] = useState(null);
  const [pending, setPending] = useState(null); // { user, type: 'role'|'status', value }

  const query = { q: params.q, role: params.role, status: params.status, page: params.page || 1, limit: 15 };
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.users(query), queryFn: () => adminService.users(query), placeholderData: keepPreviousData });

  const mutation = useMutation({
    mutationFn: ({ user, type, value }) => (type === 'role' ? adminService.changeRole(user._id, value) : adminService.changeUserStatus(user._id, value)),
    onSuccess: (res) => {
      toast.success(res.message);
      setPending(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
      setPending(null);
    },
  });

  const columns = [
    {
      key: 'name',
      header: 'User',
      primary: true,
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar src={u.avatar} name={u.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium">{u.name}{String(u._id) === String(me?._id) && <span className="ml-1.5 text-xs text-ink-400">(you)</span>}</p>
            <p className="truncate text-xs text-ink-400">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <label>
          <span className="sr-only">Role for {u.name}</span>
          <select
            value={u.role}
            disabled={String(u._id) === String(me?._id)}
            onChange={(e) => setPending({ user: u, type: 'role', value: e.target.value })}
            className="h-8 rounded-md border border-sand-300 bg-white px-2 text-sm capitalize disabled:opacity-60"
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
      ),
    },
    { key: 'status', header: 'Status', render: (u) => <StatusBadge status={u.isActive ? 'active' : 'suspended'} /> },
    { key: 'listings', header: 'Listings', hideOnMobile: true, render: (u) => u.propertyCount },
    { key: 'createdAt', header: 'Joined', hideOnMobile: true, render: (u) => <span className="whitespace-nowrap text-ink-500">{formatDate(u.createdAt)}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => setViewing(u._id)} aria-label={`View ${u.name}`} title="View profile"><Eye className="size-4" /></Button>
          {String(u._id) !== String(me?._id) && (
            u.isActive ? (
              <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50" onClick={() => setPending({ user: u, type: 'status', value: false })} aria-label={`Suspend ${u.name}`} title="Suspend"><Ban className="size-4" /></Button>
            ) : (
              <Button variant="ghost" size="icon" className="text-emerald-700 hover:bg-emerald-50" onClick={() => setPending({ user: u, type: 'status', value: true })} aria-label={`Activate ${u.name}`} title="Activate"><UserCheck className="size-4" /></Button>
            )
          )}
        </div>
      ),
    },
  ];

  const confirmCopy = !pending ? {} : pending.type === 'role'
    ? { title: `Change role to ${pending.value}?`, message: `${pending.user.name} will be signed out and their permissions will change to “${pending.value}”.`, confirmLabel: 'Change role', tone: pending.value === 'admin' ? 'danger' : 'primary' }
    : pending.value
      ? { title: 'Activate this account?', message: `${pending.user.name} will be able to log in again.`, confirmLabel: 'Activate', tone: 'primary' }
      : { title: 'Suspend this account?', message: `${pending.user.name} will be signed out immediately and won’t be able to log in.`, confirmLabel: 'Suspend', tone: 'danger' };

  return (
    <div>
      <PageTitle title="Users" description="Manage roles and account access." />
      <AdminToolbar search={params.q} onSearch={(q) => setParams({ q })} placeholder="Search by name or email">
        <FilterSelect label="Role" value={params.role} onChange={(role) => setParams({ role })} options={ROLES} />
        <FilterSelect label="Status" value={params.status} onChange={(status) => setParams({ status })} options={[{ value: 'active', label: 'Active' }, { value: 'suspended', label: 'Suspended' }]} />
      </AdminToolbar>
      <p className="mb-3 text-sm text-ink-500">{data?.meta?.total ?? 0} users</p>
      <DataTable columns={columns} rows={data?.data} isLoading={isLoading} error={error} onRetry={refetch} emptyTitle="No users found" />
      <Pagination meta={data?.meta} onPageChange={(page) => setParams({ page })} className="mt-6" />

      <UserDetails userId={viewing} onClose={() => setViewing(null)} />
      <ConfirmationDialog open={Boolean(pending)} onClose={() => setPending(null)} onConfirm={() => mutation.mutate(pending)} loading={mutation.isPending} {...confirmCopy} />
    </div>
  );
}
