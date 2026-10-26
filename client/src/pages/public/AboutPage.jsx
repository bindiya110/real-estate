import { useQuery } from '@tanstack/react-query';
import { Award, Eye, HeartHandshake, ShieldCheck } from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const VALUES = [
  { icon: ShieldCheck, title: 'Trust first', text: 'We review every listing and every agent profile so people can make decisions with confidence.' },
  { icon: Eye, title: 'Radical transparency', text: 'Real photos, clear prices and honest descriptions. No bait-and-switch listings.' },
  { icon: HeartHandshake, title: 'People over pipelines', text: 'Behind every search is a family or a business making a big decision. We never forget that.' },
  { icon: Award, title: 'Local expertise', text: 'Our agents live in the neighbourhoods they sell, and it shows in the advice they give.' },
];

export default function AboutPage() {
  useDocumentTitle('About us');
  const { data } = useQuery({ queryKey: queryKeys.content.stats, queryFn: contentService.stats, staleTime: 5 * 60_000 });
  const stats = data?.data;

  return (
    <>
      <PageHeader title="About EstateHub" description="We are building the most trusted place in India to find, rent and sell a home." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]} />

      <section className="py-16 sm:py-20">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our story" title="Started by people who were tired of fake listings" className="mb-5" />
            <div className="space-y-4 leading-relaxed text-ink-600">
              <p>EstateHub began in 2019 when our founders spent six frustrating months searching for an apartment, only to find that half the listings they called about did not exist.</p>
              <p>So we built something different: a marketplace where every listing is reviewed by a real person, every agent is vetted, and prices are shown upfront. Today, thousands of families and businesses use EstateHub to find their next space.</p>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80" alt="Warm, sunlit dining area" className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" />
        </Container>
      </section>

      {stats && (
        <section className="border-y border-sand-200 bg-white py-12">
          <Container>
            <dl className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
              {[[stats.properties, 'Verified listings'], [stats.agents, 'Trusted agents'], [stats.cities, 'Cities covered']].map(([value, label]) => (
                <div key={label}>
                  <dd className="font-display text-4xl font-semibold text-accent-600">{value}+</dd>
                  <dt className="mt-1 text-sm text-ink-500">{label}</dt>
                </div>
              ))}
            </dl>
          </Container>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <Container>
          <SectionHeading eyebrow="What we believe" title="Our values" align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="card p-6">
                <span className="grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-600"><Icon className="size-5" aria-hidden /></span>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Button to="/contact" size="lg">Get in touch</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
