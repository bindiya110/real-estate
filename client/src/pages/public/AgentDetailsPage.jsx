import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, Mail, MapPin, Phone, UserX } from 'lucide-react';
import Container from '../../components/common/Container';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import PropertyGrid from '../../components/property/PropertyGrid';
import ContactAgentForm from '../../components/property/ContactAgentForm';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { formatDate } from '../../utils/format';

export default function AgentDetailsPage() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.content.agent(id), queryFn: () => contentService.agent(id) });
  const agent = data?.data?.agent;
  const properties = data?.data?.properties ?? [];
  useDocumentTitle(agent?.name ?? 'Agent');

  if (isLoading) {
    return (
      <Container className="py-10">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="mt-8 h-80 rounded-xl" />
      </Container>
    );
  }
  if ([400, 404].includes(error?.response?.status)) {
    return <Container className="py-20"><EmptyState icon={UserX} title="Agent not found" action={<Button to="/agents">All agents</Button>} /></Container>;
  }
  if (error) return <Container className="py-20"><ErrorState error={error} onRetry={refetch} /></Container>;

  return (
    <Container className="py-8 sm:py-10">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Agents', to: '/agents' }, { label: agent.name }]} />

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
            <Avatar src={agent.avatar} name={agent.name} size="xl" />
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-semibold">{agent.name}</h1>
              <p className="text-ink-500">{agent.designation || 'Property agent'}</p>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-600">
                {agent.agency && <li className="flex items-center gap-1.5"><Building2 className="size-4 text-ink-400" aria-hidden />{agent.agency}</li>}
                {agent.city && <li className="flex items-center gap-1.5"><MapPin className="size-4 text-ink-400" aria-hidden />{agent.city}</li>}
                {agent.phone && <li><a href={`tel:${agent.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-accent-600"><Phone className="size-4 text-ink-400" aria-hidden />{agent.phone}</a></li>}
                {agent.email && <li><a href={`mailto:${agent.email}`} className="flex items-center gap-1.5 hover:text-accent-600"><Mail className="size-4 text-ink-400" aria-hidden />{agent.email}</a></li>}
              </ul>
              <p className="mt-3 text-xs text-ink-400">Member since {formatDate(agent.createdAt, { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          {agent.bio && (
            <section className="mt-8">
              <h2 className="mb-2 text-xl font-semibold">About {agent.name.split(' ')[0]}</h2>
              <p className="leading-relaxed text-ink-600">{agent.bio}</p>
            </section>
          )}
        </div>

        <aside className="card p-6 lg:self-start" aria-label="Contact agent">
          <h2 className="mb-4 font-semibold">Contact {agent.name.split(' ')[0]}</h2>
          <ContactAgentForm agentId={agent._id} compact />
        </aside>
      </div>

      <section className="mt-14">
        <h2 className="font-display mb-6 text-2xl font-semibold">Listings by {agent.name} ({properties.length})</h2>
        <PropertyGrid properties={properties} emptyTitle="No active listings right now" />
      </section>
    </Container>
  );
}
