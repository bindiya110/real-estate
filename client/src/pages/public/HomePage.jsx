import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BadgeCheck, Handshake, MapPin, Quote, ShieldCheck, Sparkles, Star } from 'lucide-react';
import Container from '../../components/common/Container';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import { Skeleton } from '../../components/common/States';
import PropertyGrid from '../../components/property/PropertyGrid';
import PropertySearch from '../../components/search/PropertySearch';
import NewsletterForm from '../../components/layout/NewsletterForm';
import propertyService from '../../services/propertyService';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { cn, sizedImage } from '../../utils/format';

const FALLBACK_HERO = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80';

function Hero() {
  const { data } = useQuery({ queryKey: queryKeys.content.settings, queryFn: contentService.settings, staleTime: 10 * 60_000 });
  const { data: statsRes } = useQuery({ queryKey: queryKeys.content.stats, queryFn: contentService.stats, staleTime: 5 * 60_000 });
  const settings = data?.data;
  const stats = statsRes?.data;

  return (
    <section className="relative -mt-16 lg:-mt-18">
      <div className="absolute inset-0 overflow-hidden">
        <img src={sizedImage(settings?.heroImage || FALLBACK_HERO, 2000)} alt="" className="size-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-linear-to-b from-ink-950/55 via-ink-950/35 to-ink-950/70" />
      </div>
      <Container className="relative flex min-h-[640px] flex-col justify-end pt-32 pb-12 sm:min-h-[700px] sm:pb-16">
        <div className="max-w-2xl text-white">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <BadgeCheck className="size-3.5 text-accent-200" aria-hidden /> Every listing verified by our team
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-semibold text-white sm:text-5xl lg:text-6xl">
            {settings?.heroTitle || 'Find a home that fits the way you live'}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
            {settings?.heroSubtitle || 'Browse verified homes for sale and rent, compare neighbourhoods, and talk directly to trusted agents.'}
          </p>
        </div>
        <PropertySearch className="mt-10" />
        {stats && (
          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-3 text-white">
            {[
              [stats.properties, 'verified listings'],
              [stats.agents, 'trusted agents'],
              [stats.cities, 'cities covered'],
            ].map(([value, label]) => (
              <div key={label} className="flex items-baseline gap-2">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-2xl font-semibold">{value}+</dd>
                <span className="text-sm text-white/75">{label}</span>
              </div>
            ))}
          </dl>
        )}
      </Container>
    </section>
  );
}

function FeaturedSection() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.properties.featured, queryFn: () => propertyService.featured(6) });
  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Handpicked"
          title="Featured properties"
          description="Standout homes selected by our team for location, quality and value."
          action={<Button to="/buy" variant="secondary" iconRight={ArrowRight}>View all</Button>}
        />
        <PropertyGrid properties={data?.data} isLoading={isLoading} error={error} onRetry={refetch} skeletonCount={6} emptyTitle="No featured properties yet" />
      </Container>
    </section>
  );
}

function CategoriesSection() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.categories, queryFn: contentService.categories, staleTime: 10 * 60_000 });
  const categories = data?.data ?? [];
  if (!isLoading && !categories.length) return null;

  return (
    <section className="bg-sand-100/70 py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Browse by type" title="Explore property categories" align="center" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {isLoading
            ? Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)
            : categories.map((c) => (
                <Link key={c._id} to={`/buy?category=${c.slug}`} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-ink-800">
                  {c.image && <img src={sizedImage(c.image, 500)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <h3 className="font-semibold text-white">{c.name}</h3>
                    <p className="text-xs text-white/75">{c.propertyCount} {c.propertyCount === 1 ? 'listing' : 'listings'}</p>
                  </div>
                </Link>
              ))}
        </div>
      </Container>
    </section>
  );
}

function LatestSection() {
  const [type, setType] = useState('sale');
  const { data, isLoading, error, refetch } = useQuery({ queryKey: queryKeys.properties.latest(type), queryFn: () => propertyService.latest(8, type) });

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Just listed"
          title="Latest properties"
          action={(
            <div role="tablist" aria-label="Listing type" className="inline-flex rounded-lg border border-sand-300 bg-white p-1">
              {[['sale', 'For sale'], ['rent', 'For rent']].map(([v, label]) => (
                <button
                  key={v}
                  role="tab"
                  type="button"
                  aria-selected={type === v}
                  onClick={() => setType(v)}
                  className={cn('rounded-md px-4 py-1.5 text-sm font-medium', type === v ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        />
        <PropertyGrid properties={data?.data} isLoading={isLoading} error={error} onRetry={refetch} columns={4} skeletonCount={8} />
        <div className="mt-10 text-center">
          <Button to={type === 'rent' ? '/rent' : '/buy'} variant="dark" iconRight={ArrowRight}>
            Browse all {type === 'rent' ? 'rentals' : 'homes for sale'}
          </Button>
        </div>
      </Container>
    </section>
  );
}

function LocationsSection() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.properties.locations, queryFn: propertyService.locations, staleTime: 10 * 60_000 });
  const locations = data?.data ?? [];
  if (!isLoading && !locations.length) return null;

  return (
    <section className="bg-ink-900 py-16 text-white sm:py-24">
      <Container>
        <div className="mb-10 max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-accent-300 uppercase">Where people are looking</p>
          <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Popular locations</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-white/10" />)
            : locations.map((loc, i) => (
                <Link
                  key={`${loc.city}-${loc.state}`}
                  to={`/buy?city=${encodeURIComponent(loc.city)}`}
                  className={cn('group relative flex h-32 flex-col justify-end overflow-hidden rounded-xl p-4 sm:h-40', i === 0 && 'sm:col-span-2 lg:col-span-2')}
                >
                  {loc.image && <img src={sizedImage(loc.image, 700)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-linear-to-t from-ink-950/90 to-ink-950/10" />
                  <div className="relative">
                    <h3 className="flex items-center gap-1.5 font-semibold text-white"><MapPin className="size-4 text-accent-300" aria-hidden />{loc.city}</h3>
                    <p className="text-xs text-white/70">{loc.count} {loc.count === 1 ? 'property' : 'properties'}{loc.state ? ` · ${loc.state}` : ''}</p>
                  </div>
                </Link>
              ))}
        </div>
      </Container>
    </section>
  );
}

const REASONS = [
  { icon: ShieldCheck, title: 'Verified listings', text: 'Every property is reviewed by our team before it goes live, so you only see genuine homes.' },
  { icon: Handshake, title: 'Trusted agents', text: 'Work with experienced local agents who know the neighbourhoods and the paperwork.' },
  { icon: Sparkles, title: 'Transparent pricing', text: 'Clear prices and monthly rents, with no hidden brokerage surprises at the end.' },
];

function WhyChooseSection() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <img src={sizedImage('https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', 1000)} alt="Bright, modern living room" loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
          <div className="absolute -bottom-6 left-6 hidden rounded-xl bg-white p-5 shadow-lift sm:block">
            <p className="font-display text-3xl font-semibold text-accent-600">98%</p>
            <p className="text-sm text-ink-500">of buyers would recommend us</p>
          </div>
        </div>
        <div>
          <SectionHeading eyebrow="Why EstateHub" title="A calmer way to find your next home" description="We built EstateHub to take the guesswork out of buying and renting, from the first search to the final handshake." className="mb-8" />
          <ul className="space-y-6">
            {REASONS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600"><Icon className="size-5" aria-hidden /></span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function AgentsSection() {
  const { data, isLoading } = useQuery({ queryKey: queryKeys.content.featuredAgents, queryFn: contentService.featuredAgents, staleTime: 5 * 60_000 });
  const agents = data?.data ?? [];
  if (!isLoading && !agents.length) return null;

  return (
    <section className="bg-sand-100/70 py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Our people" title="Meet our top agents" action={<Button to="/agents" variant="secondary" iconRight={ArrowRight}>All agents</Button>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)
            : agents.map((agent) => (
                <Link key={agent._id} to={`/agents/${agent._id}`} className="card group flex flex-col items-center p-6 text-center transition-shadow hover:shadow-lift">
                  <Avatar src={agent.avatar} name={agent.name} size="xl" />
                  <h3 className="mt-4 font-semibold group-hover:text-accent-600">{agent.name}</h3>
                  <p className="text-sm text-ink-500">{agent.designation}</p>
                  <p className="mt-1 text-xs text-ink-400">{agent.agency}</p>
                  <p className="mt-4 rounded-full bg-sand-100 px-3 py-1 text-xs font-medium text-ink-600">{agent.listingCount} active listings</p>
                </Link>
              ))}
        </div>
      </Container>
    </section>
  );
}

function TestimonialsSection() {
  const { data } = useQuery({ queryKey: queryKeys.content.testimonials, queryFn: contentService.testimonials, staleTime: 10 * 60_000 });
  const items = data?.data ?? [];
  if (!items.length) return null;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading eyebrow="Testimonials" title="What our customers say" align="center" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {items.slice(0, 4).map((t) => (
            <figure key={t._id} className="card flex flex-col p-6">
              <Quote className="size-7 text-accent-300" aria-hidden />
              <div className="mt-3 flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={cn('size-4', i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-sand-300')} aria-hidden />
                ))}
              </div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">“{t.content}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-sand-200 pt-4">
                <Avatar src={t.avatar} name={t.name} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  {t.role && <p className="text-xs text-ink-400">{t.role}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="pb-16 sm:pb-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-ink-900 px-6 py-12 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:py-16">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">Thinking of selling or renting out?</h2>
            <p className="mt-3 text-ink-200">List your property for free. Our team reviews it within 24 hours and connects you with serious buyers and tenants.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button to="/sell" size="lg">List your property</Button>
              <Button to="/contact" size="lg" variant="secondary" className="border-white/20 bg-transparent text-white hover:bg-white/10">Talk to us</Button>
            </div>
          </div>
          <div className="mt-10 w-full max-w-md lg:mt-0">
            <h3 className="font-semibold text-white">Stay in the loop</h3>
            <p className="mt-1 mb-4 text-sm text-ink-200">Weekly picks and price drops, straight to your inbox.</p>
            <NewsletterForm dark />
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HomePage() {
  useDocumentTitle();
  return (
    <>
      <Hero />
      <FeaturedSection />
      <CategoriesSection />
      <LatestSection />
      <LocationsSection />
      <WhyChooseSection />
      <AgentsSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
