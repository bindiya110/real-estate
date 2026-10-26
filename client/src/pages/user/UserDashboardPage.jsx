import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, CircleCheck, CirclePlus, Clock, Heart, MessageSquare, CircleX } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import { EmptyState, Skeleton } from '../../components/common/States';
import userService from '../../services/userService';
import inquiryService from '../../services/inquiryService';
import { useAuth } from '../../context/AuthContext';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatListingPrice, sizedImage, timeAgo } from '../../utils/format';

export default function UserDashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data: statsRes } = useQuery({ queryKey: queryKeys.my.stats, queryFn: userService.stats });
  const propertyParams = { limit: 4 };
  const { data: propsRes, isLoading: propsLoading } = useQuery({ queryKey: queryKeys.my.properties(propertyParams), queryFn: () => userService.myProperties(propertyParams) });
  const inquiryParams = { box: 'received', limit: 5 };
  const { data: inqRes, isLoading: inqLoading } = useQuery({ queryKey: queryKeys.my.inquiries(inquiryParams), queryFn: () => inquiryService.mine(inquiryParams) });
  const stats = statsRes?.data;

  return (
    <div>
      <PageTitle
        title={`Hello, ${user?.name.split(' ')[0]}`}
        description="Here’s what’s happening with your listings."
        actions={<Button to="/dashboard/properties/new" icon={CirclePlus}>Add listing</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total listings" value={stats?.total} icon={Building2} to="/dashboard/properties" />
        <StatCard label="Approved" value={stats?.approved} icon={CircleCheck} tone="success" to="/dashboard/properties?status=approved" />
        <StatCard label="Pending review" value={stats?.pending} icon={Clock} tone="warning" to="/dashboard/properties?status=pending" />
        <StatCard label="Rejected" value={stats?.rejected} icon={CircleX} tone="danger" to="/dashboard/properties?status=rejected" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <StatCard label="Inquiries received" value={stats?.inquiriesReceived} icon={MessageSquare} tone="info" to="/dashboard/inquiries" />
        <StatCard label="Saved properties" value={stats?.favorites} icon={Heart} tone="accent" to="/dashboard/favorites" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent listings</h2>
            <Link to="/dashboard/properties" className="link text-sm">View all</Link>
          </div>
          {propsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : !propsRes?.data?.length ? (
            <EmptyState className="border-0 py-8" title="No listings yet" description="Create your first listing to start receiving inquiries." action={<Button to="/dashboard/properties/new" size="sm">Add listing</Button>} />
          ) : (
            <ul className="divide-y divide-sand-200">
              {propsRes.data.map((p) => (
                <li key={p._id} className="flex items-center gap-3 py-3">
                  <img src={sizedImage(p.images?.[0]?.url, 160)} alt="" className="size-14 shrink-0 rounded-lg bg-sand-200 object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/dashboard/properties/${p._id}/edit`} className="block truncate text-sm font-medium hover:text-accent-600">{p.title}</Link>
                    <p className="text-xs text-ink-400">{formatListingPrice(p)} · {p.city}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent inquiries</h2>
            <Link to="/dashboard/inquiries" className="link text-sm">View all</Link>
          </div>
          {inqLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : !inqRes?.data?.length ? (
            <EmptyState className="border-0 py-8" icon={MessageSquare} title="No inquiries yet" description="Messages from interested buyers and tenants will appear here." />
          ) : (
            <ul className="divide-y divide-sand-200">
              {inqRes.data.map((inq) => (
                <li key={inq._id} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium">{inq.name}</p>
                    <StatusBadge status={inq.status} type="inquiry" />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-ink-400">{inq.property?.title ?? 'General inquiry'} · {timeAgo(inq.createdAt)}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-ink-600">{inq.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
