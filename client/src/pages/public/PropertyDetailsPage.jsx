import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bath, BedDouble, Calendar, Car, Check, Eye, Home, Layers, MapPin, Phone, Ruler, Sofa, TriangleAlert,
} from 'lucide-react';
import Container from '../../components/common/Container';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import StatusBadge, { Badge } from '../../components/common/StatusBadge';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import PropertyGallery from '../../components/property/PropertyGallery';
import PropertyGrid from '../../components/property/PropertyGrid';
import FavoriteButton from '../../components/property/FavoriteButton';
import ShareButton from '../../components/property/ShareButton';
import ContactAgentForm from '../../components/property/ContactAgentForm';
import propertyService from '../../services/propertyService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { AMENITIES, AVAILABILITY, FURNISHING, PROPERTY_TYPES, labelFor } from '../../constants';
import { formatArea, formatDate, formatListingPrice, formatPrice } from '../../utils/format';

function DetailsSkeleton() {
  return (
    <Container className="py-8">
      <Skeleton className="h-4 w-64" />
      <Skeleton className="mt-6 h-10 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/3" />
      <Skeleton className="mt-8 h-[420px] w-full rounded-xl" />
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2"><Skeleton className="h-24" /><Skeleton className="h-48" /></div>
        <Skeleton className="h-96" />
      </div>
    </Container>
  );
}

function KeyFacts({ property }) {
  const facts = [
    property.bedrooms > 0 && { icon: BedDouble, label: 'Bedrooms', value: property.bedrooms },
    property.bathrooms > 0 && { icon: Bath, label: 'Bathrooms', value: property.bathrooms },
    { icon: Ruler, label: 'Area', value: formatArea(property.area, property.areaUnit) },
    { icon: Home, label: 'Type', value: labelFor(PROPERTY_TYPES, property.propertyType) },
    { icon: Sofa, label: 'Furnishing', value: labelFor(FURNISHING, property.furnishing) },
    property.parkingSpaces > 0 && { icon: Car, label: 'Parking', value: `${property.parkingSpaces} space${property.parkingSpaces > 1 ? 's' : ''}` },
    property.yearBuilt && { icon: Calendar, label: 'Year built', value: property.yearBuilt },
    property.category && { icon: Layers, label: 'Category', value: property.category.name },
  ].filter(Boolean);

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-sand-200 bg-sand-200 sm:grid-cols-4">
      {facts.map(({ icon: Icon, label, value }) => (
        <div key={label} className="bg-white p-4">
          <dt className="flex items-center gap-1.5 text-xs text-ink-400"><Icon className="size-3.5" aria-hidden />{label}</dt>
          <dd className="mt-1 font-semibold text-ink-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AgentCard({ property }) {
  const contact = property.agent || property.owner;
  if (!contact) return null;
  const isAgent = contact.role === 'agent';

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Avatar src={contact.avatar} name={contact.name} size="lg" />
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">{isAgent ? 'Listing agent' : 'Listed by owner'}</p>
          {isAgent ? (
            <Link to={`/agents/${contact._id}`} className="block truncate font-semibold hover:text-accent-600">{contact.name}</Link>
          ) : (
            <p className="truncate font-semibold">{contact.name}</p>
          )}
          {contact.agency && <p className="truncate text-sm text-ink-500">{contact.agency}</p>}
        </div>
      </div>
      {isAgent && contact.phone && (
        <Button href={`tel:${contact.phone.replace(/\s/g, '')}`} variant="secondary" icon={Phone} className="mt-4 w-full">
          {contact.phone}
        </Button>
      )}
      <div className="mt-5 border-t border-sand-200 pt-5">
        <h2 className="mb-4 font-semibold">Ask about this property</h2>
        <ContactAgentForm propertyId={property._id} compact defaultMessage={`Hi, I'm interested in "${property.title}". Please share more details.`} />
      </div>
    </div>
  );
}

function MapEmbed({ property }) {
  const { lat, lng } = property.coordinates || {};
  const query = lat && lng ? `${lat},${lng}` : [property.address, property.city, property.state, property.country].filter(Boolean).join(', ');
  return (
    <div className="overflow-hidden rounded-xl border border-sand-200">
      <iframe
        title={`Map of ${property.title}`}
        src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`}
        className="h-72 w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function PropertyDetailsPage() {
  const { slug } = useParams();
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.properties.detail(slug), queryFn: () => propertyService.bySlug(slug) });
  const property = data?.data;

  const { data: similarRes, isLoading: similarLoading } = useQuery({
    queryKey: queryKeys.properties.similar(property?._id),
    queryFn: () => propertyService.similar(property._id),
    enabled: Boolean(property?._id && property.status === 'approved'),
  });

  useDocumentTitle(property?.title ?? 'Property');

  if (isLoading) return <DetailsSkeleton />;
  if (error?.response?.status === 404) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={TriangleAlert}
          title="Property not found"
          description="This listing may have been sold, rented or removed by the owner."
          action={<Button to="/buy">Browse properties</Button>}
        />
      </Container>
    );
  }
  if (error) return <Container className="py-20"><ErrorState error={error} onRetry={refetch} /></Container>;

  const location = [property.address, property.city, property.state, property.postalCode].filter(Boolean).join(', ');
  const listingPage = property.listingType === 'rent' ? { label: 'Rent', to: '/rent' } : { label: 'Buy', to: '/buy' };
  const amenities = property.amenities ?? [];

  return (
    <>
      <Container className="py-6 sm:py-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, listingPage, { label: property.city, to: `${listingPage.to}?city=${encodeURIComponent(property.city)}` }, { label: property.title }]} />

        {property.status !== 'approved' && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
            <StatusBadge status={property.status} />
            <span>Only you can see this listing until it is approved.</span>
            {property.rejectionReason && <span className="w-full text-amber-800">Reason: {property.rejectionReason}</span>}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge tone="dark">{property.listingType === 'rent' ? 'For rent' : 'For sale'}</Badge>
              {property.featured && <Badge tone="accent">Featured</Badge>}
              <Badge tone={property.availabilityStatus === 'available' ? 'success' : 'warning'}>{labelFor(AVAILABILITY, property.availabilityStatus)}</Badge>
            </div>
            <h1 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{property.title}</h1>
            <p className="mt-2 flex items-start gap-1.5 text-ink-500"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />{location}</p>
          </div>
          <div className="shrink-0 lg:text-right">
            <p className="font-display text-3xl font-semibold text-ink-900 sm:text-4xl">{formatListingPrice(property)}</p>
            {property.listingType === 'sale' && property.area > 0 && (
              <p className="text-sm text-ink-400">{formatPrice(Math.round(property.price / property.area), property.currency, { compact: false })} per {property.areaUnit === 'sqm' ? 'sq m' : 'sq ft'}</p>
            )}
            <div className="mt-3 flex gap-2 lg:justify-end">
              <FavoriteButton propertyId={property._id} withLabel />
              <ShareButton title={property.title} text={`${property.title} - ${formatListingPrice(property)}`} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <PropertyGallery images={property.images} title={property.title} />
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <KeyFacts property={property} />

            <section>
              <h2 className="mb-3 text-xl font-semibold">About this property</h2>
              <p className="leading-relaxed whitespace-pre-line text-ink-600">{property.description}</p>
              <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-400">
                <span>Listed {formatDate(property.publishedAt || property.createdAt)}</span>
                <span className="inline-flex items-center gap-1"><Eye className="size-3.5" aria-hidden />{property.views ?? 0} views</span>
              </p>
            </section>

            {amenities.length > 0 && (
              <section>
                <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {amenities.map((a) => (
                    <li key={a} className="flex items-center gap-2.5 text-sm text-ink-700">
                      <span className="grid size-6 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check className="size-3.5" aria-hidden /></span>
                      {labelFor(AMENITIES, a)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section>
              <h2 className="mb-4 text-xl font-semibold">Location</h2>
              <MapEmbed property={property} />
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Contact">
            <AgentCard property={property} />
          </aside>
        </div>
      </Container>

      {property.status === 'approved' && (similarLoading || similarRes?.data?.length > 0) && (
        <section className="mt-8 border-t border-sand-200 bg-sand-100/60 py-14">
          <Container>
            <h2 className="font-display mb-8 text-2xl font-semibold sm:text-3xl">Similar properties</h2>
            <PropertyGrid properties={similarRes?.data} isLoading={similarLoading} columns={4} skeletonCount={4} />
          </Container>
        </section>
      )}
    </>
  );
}
