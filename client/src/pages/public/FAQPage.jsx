import { ChevronDown } from 'lucide-react';
import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const FAQS = [
  {
    group: 'Buying & renting',
    items: [
      ['Are the listings on EstateHub verified?', 'Yes. Every listing is reviewed by our moderation team before it is published. We check photos, pricing and basic ownership details, and remove listings that are reported as inaccurate.'],
      ['Do I pay a fee to contact an agent?', 'No. Browsing listings and contacting agents or owners through EstateHub is completely free for home seekers.'],
      ['Is the rent shown per month?', 'Yes. All rental prices are monthly rent. Sale prices are the total asking price.'],
      ['Can I save properties to look at later?', 'Create a free account and tap the heart icon on any listing. Your saved properties appear under Favorites in your dashboard.'],
    ],
  },
  {
    group: 'Selling & listing',
    items: [
      ['How do I list my property?', 'Create an account, verify your email, then choose “List a property”. The form walks you through details, pricing, location, specifications and photos. You can save a draft at any time.'],
      ['How long does approval take?', 'Most listings are reviewed within 24 hours. You will see the status in your dashboard, and if changes are needed we will tell you why.'],
      ['Why was my listing rejected?', 'Common reasons are low-quality or stock photos, missing details, or prices that do not match the description. You can edit and resubmit a rejected listing.'],
      ['Can I edit my listing after it is approved?', 'Yes. Edits are sent back to our team for a quick review before the updated listing goes live again.'],
    ],
  },
  {
    group: 'Account & privacy',
    items: [
      ['How do I reset my password?', 'Use “Forgot password” on the login page. We will email you a secure link that expires after 30 minutes.'],
      ['Who can see my contact details?', 'Your email and phone are only shared with the agent or owner you contact. Agents choose what appears on their public profile.'],
    ],
  },
];

export default function FAQPage() {
  useDocumentTitle('Frequently asked questions');
  return (
    <>
      <PageHeader title="Frequently asked questions" description="Everything you need to know about buying, renting and listing on EstateHub." breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
      <Container className="max-w-3xl py-12 sm:py-16">
        {FAQS.map((group) => (
          <section key={group.group} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">{group.group}</h2>
            <div className="divide-y divide-sand-200 overflow-hidden rounded-xl border border-sand-200 bg-white">
              {group.items.map(([q, a]) => (
                <details key={q} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium hover:bg-sand-50 [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="size-4 shrink-0 text-ink-400 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-ink-600">{a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="card flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Still have questions?</h2>
            <p className="text-sm text-ink-500">Our support team is happy to help.</p>
          </div>
          <Button to="/contact">Contact support</Button>
        </div>
      </Container>
    </>
  );
}
