import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Search, Users } from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/common/Avatar';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';
import useDebounce from '../../hooks/useDebounce';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function AgentsPage() {
  useDocumentTitle('Find an agent');
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const debounced = useDebounce(q, 400);
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if ((searchParams.get('q') ?? '') === debounced.trim()) return;
    setSearchParams(debounced.trim() ? { q: debounced.trim() } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const params = { q: searchParams.get('q') || undefined, page, limit: 12 };
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.content.agents(params),
    queryFn: () => contentService.agents(params),
    placeholderData: keepPreviousData,
  });

  return (
    <>
      <PageHeader title="Find a trusted agent" description="Experienced local experts who know the neighbourhoods, the prices and the paperwork." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Agents' }]}>
        <div className="relative mt-6 max-w-md">
          <label htmlFor="agent-search" className="sr-only">Search agents</label>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <input id="agent-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, agency or city" className="field-control h-11 pl-10" />
        </div>
      </PageHeader>

      <Container className="py-10 sm:py-14">
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-56 rounded-xl" />)}</div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data?.data?.length ? (
          <EmptyState icon={Users} title="No agents found" description="Try a different name or city." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((agent) => (
              <Link key={agent._id} to={`/agents/${agent._id}`} className="card group flex gap-4 p-5 transition-shadow hover:shadow-lift">
                <Avatar src={agent.avatar} name={agent.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold group-hover:text-accent-600">{agent.name}</h2>
                  <p className="truncate text-sm text-ink-500">{agent.designation || 'Property agent'}</p>
                  <ul className="mt-3 space-y-1 text-sm text-ink-500">
                    {agent.agency && <li className="flex items-center gap-1.5"><Building2 className="size-3.5 shrink-0" aria-hidden /><span className="truncate">{agent.agency}</span></li>}
                    {agent.city && <li className="flex items-center gap-1.5"><MapPin className="size-3.5 shrink-0" aria-hidden />{agent.city}</li>}
                  </ul>
                  <p className="mt-3 text-xs font-semibold text-accent-600">{agent.listingCount} active listing{agent.listingCount === 1 ? '' : 's'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Pagination meta={data?.meta} onPageChange={(p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', p); return next; })} className="mt-10" />
      </Container>
    </>
  );
}
