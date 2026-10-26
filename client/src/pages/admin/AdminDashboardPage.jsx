import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Building2, CircleCheck, CircleX, Clock, Home, KeyRound, Mail, MessageSquare, UserCheck, Users,
} from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import StatCard from '../../components/dashboard/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Avatar from '../../components/common/Avatar';
import { ErrorState, Skeleton } from '../../components/common/States';
import { MonthlyListingsChart, RankedBarChart } from '../../components/admin/AdminCharts';
import adminService from '../../services/adminService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatListingPrice, sizedImage, timeAgo } from '../../utils/format';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminService.dashboard });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { totals, charts, recentUsers, recentProperties } = data.data;

  return (
    <div>
      <PageTitle title="Dashboard" description="Platform activity at a glance." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total users" value={totals.users} icon={Users} to="/admin/users" />
        <StatCard label="Agents" value={totals.agents} icon={UserCheck} tone="info" to="/admin/users?role=agent" />
        <StatCard label="Total properties" value={totals.properties} icon={Building2} to="/admin/properties" />
        <StatCard label="Pending review" value={totals.pending} icon={Clock} tone="warning" to="/admin/properties?status=pending" hint={totals.pending ? 'Needs your attention' : 'All caught up'} />
        <StatCard label="Approved" value={totals.approved} icon={CircleCheck} tone="success" to="/admin/properties?status=approved" />
        <StatCard label="Rejected" value={totals.rejected} icon={CircleX} tone="danger" to="/admin/properties?status=rejected" />
        <StatCard label="For sale / rent" value={`${totals.sale} / ${totals.rent}`} icon={Home} tone="accent" />
        <StatCard label="Inquiries" value={totals.inquiries} icon={MessageSquare} tone="info" hint={`${totals.newInquiries} new · ${totals.newMessages} contact messages`} to="/admin/inquiries" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <MonthlyListingsChart data={charts.monthly} />
        <RankedBarChart title="Listings by property type" description="All statuses" data={charts.propertyTypes} valueLabel="Listings" />
        <RankedBarChart title="Top cities" description="Approved listings" data={charts.topCities} valueLabel="Listings" />
        <RankedBarChart title="Inquiries by status" data={charts.inquiryStatus} valueLabel="Inquiries" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent listings</h2>
            <Link to="/admin/properties" className="link text-sm">Manage</Link>
          </div>
          <ul className="divide-y divide-sand-200">
            {recentProperties.map((p) => (
              <li key={p._id} className="flex items-center gap-3 py-3">
                <img src={sizedImage(p.images?.[0]?.url, 160)} alt="" className="size-12 shrink-0 rounded-lg bg-sand-200 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="truncate text-xs text-ink-400">{formatListingPrice(p)} · {p.city} · by {p.owner?.name ?? 'Unknown'} · {timeAgo(p.createdAt)}</p>
                </div>
                <StatusBadge status={p.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent registrations</h2>
            <Link to="/admin/users" className="link text-sm">Manage</Link>
          </div>
          <ul className="divide-y divide-sand-200">
            {recentUsers.map((u) => (
              <li key={u._id} className="flex items-center gap-3 py-3">
                <Avatar src={u.avatar} name={u.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="truncate text-xs text-ink-400">{u.email} · {timeAgo(u.createdAt)}</p>
                </div>
                <span className="text-xs font-medium text-ink-500 capitalize">{u.role}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-sand-50 p-3 text-xs text-ink-500">
            <Mail className="size-4" aria-hidden /> {totals.subscribers} active newsletter subscribers
            <KeyRound className="ml-auto size-4" aria-hidden /> {totals.admins} admin{totals.admins === 1 ? '' : 's'}
          </div>
        </section>
      </div>
    </div>
  );
}
