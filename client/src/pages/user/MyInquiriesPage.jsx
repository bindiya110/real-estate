import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import PageTitle from '../../components/dashboard/PageTitle';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import inquiryService from '../../services/inquiryService';
import { getErrorMessage } from '../../services/api';
import { INQUIRY_STATUS } from '../../constants';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { cn, formatDate, sizedImage, timeAgo } from '../../utils/format';

export default function MyInquiriesPage() {
  useDocumentTitle('Inquiries');
  const queryClient = useQueryClient();
  const [box, setBox] = useState('received');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const params = { box, page, limit: 10 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.my.inquiries(params),
    queryFn: () => inquiryService.mine(params),
    placeholderData: keepPreviousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => inquiryService.updateStatus(id, status),
    onSuccess: (res) => {
      setOpen((o) => (o ? { ...o, status: res.data.status } : o));
      queryClient.invalidateQueries({ queryKey: queryKeys.my.all });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const view = (inq) => {
    setOpen(inq);
    if (box === 'received' && inq.status === 'new') statusMutation.mutate({ id: inq._id, status: 'read' });
  };

  const switchBox = (b) => {
    setBox(b);
    setPage(1);
  };

  return (
    <div>
      <PageTitle title="Inquiries" description="Messages from people interested in your listings, and messages you’ve sent." />

      <div role="tablist" className="mb-5 inline-flex rounded-lg border border-sand-300 bg-white p-1">
        {[['received', 'Received'], ['sent', 'Sent']].map(([value, label]) => (
          <button key={value} role="tab" type="button" aria-selected={box === value} onClick={() => switchBox(value)} className={cn('rounded-md px-4 py-1.5 text-sm font-medium', box === value ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900')}>
            {label}
            {value === 'received' && data?.meta?.unread > 0 && <span className="ml-1.5 rounded-full bg-accent-500 px-1.5 text-[11px] text-white">{data.meta.unread}</span>}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : !data?.data?.length ? (
        <EmptyState icon={MessageSquare} title={box === 'received' ? 'No inquiries received yet' : 'You haven’t sent any inquiries'} description={box === 'sent' ? 'Contact an agent from any property page.' : 'When someone contacts you about a listing, it will show up here.'} />
      ) : (
        <ul className="space-y-3">
          {data.data.map((inq) => {
            const counterpart = box === 'received' ? inq.name : inq.recipient?.name;
            return (
              <li key={inq._id}>
                <button type="button" onClick={() => view(inq)} className={cn('card flex w-full gap-4 p-4 text-left transition-shadow hover:shadow-lift', inq.status === 'new' && box === 'received' && 'border-l-4 border-l-accent-500')}>
                  {inq.property?.images?.[0]?.url && <img src={sizedImage(inq.property.images[0].url, 160)} alt="" className="hidden size-16 shrink-0 rounded-lg object-cover sm:block" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate font-medium">{box === 'received' ? 'From' : 'To'} {counterpart}</p>
                      <StatusBadge status={inq.status} type="inquiry" />
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-400">{inq.property?.title ?? 'Direct message'} · {timeAgo(inq.createdAt)}</p>
                    <p className="mt-1.5 line-clamp-2 text-sm text-ink-600">{inq.message}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <Pagination meta={data?.meta} onPageChange={setPage} className="mt-6" />

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title="Inquiry details" size="lg">
        {open && (
          <div className="space-y-5">
            {open.property && (
              <Link to={`/properties/${open.property.slug}`} className="flex items-center gap-3 rounded-lg border border-sand-200 p-3 hover:bg-sand-50">
                {open.property.images?.[0]?.url && <img src={sizedImage(open.property.images[0].url, 160)} alt="" className="size-12 rounded-md object-cover" />}
                <span className="text-sm font-medium">{open.property.title}</span>
              </Link>
            )}
            <div>
              <p className="font-semibold">{open.name}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
                <a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 hover:text-accent-600"><Mail className="size-4" />{open.email}</a>
                {open.phone && <a href={`tel:${open.phone}`} className="inline-flex items-center gap-1.5 hover:text-accent-600"><Phone className="size-4" />{open.phone}</a>}
              </div>
              <p className="mt-1 text-xs text-ink-400">{formatDate(open.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</p>
            </div>
            <p className="rounded-lg bg-sand-50 p-4 text-sm leading-relaxed whitespace-pre-line text-ink-700">{open.message}</p>
            {box === 'received' && (
              <div className="flex flex-col gap-3 border-t border-sand-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(INQUIRY_STATUS).map(([value, { label }]) => (
                    <button
                      key={value}
                      type="button"
                      disabled={statusMutation.isPending}
                      onClick={() => statusMutation.mutate({ id: open._id, status: value })}
                      className={cn('rounded-full border px-3 py-1 text-xs font-medium', open.status === value ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-300 hover:bg-sand-50')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Button href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.property?.title ?? 'Your inquiry'}`)}`} size="sm" icon={Mail} onClick={() => statusMutation.mutate({ id: open._id, status: 'replied' })}>
                  Reply by email
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
