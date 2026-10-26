import { BadgeCheck, CircleCheck, ClipboardList, ImagePlus, Send } from 'lucide-react';
import Container from '../../components/common/Container';
import SectionHeading from '../../components/common/SectionHeading';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const STEPS = [
  { icon: ClipboardList, title: 'Describe your property', text: 'Add the basics: title, type, price and location.' },
  { icon: ImagePlus, title: 'Upload photos', text: 'Up to 15 high-quality photos. Bright, real photos get more inquiries.' },
  { icon: Send, title: 'Submit for review', text: 'Our team checks every listing, usually within 24 hours.' },
  { icon: BadgeCheck, title: 'Go live', text: 'Once approved, buyers and tenants can find and contact you directly.' },
];

export default function SellPage() {
  useDocumentTitle('Sell or rent out your property');
  const { user } = useAuth();
  const startUrl = '/dashboard/properties/new';

  return (
    <>
      <section className="bg-sand-100/70">
        <Container className="grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-accent-600 uppercase">For owners & agents</p>
            <h1 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">Sell or rent out your property with confidence</h1>
            <p className="mt-4 max-w-lg text-lg text-ink-500">Free listings, verified buyers and tenants, and a dashboard to manage every inquiry in one place.</p>
            <ul className="mt-6 space-y-2.5 text-ink-700">
              {['No listing fees', 'Reach thousands of active home seekers', 'Save drafts and publish when you are ready'].map((t) => (
                <li key={t} className="flex items-center gap-2.5"><CircleCheck className="size-5 text-emerald-600" aria-hidden />{t}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={user ? startUrl : '/register'} state={user ? undefined : { from: { pathname: startUrl } }} size="lg">
                {user ? 'Create a listing' : 'Get started - it’s free'}
              </Button>
              {!user && <Button to="/login" state={{ from: { pathname: startUrl } }} size="lg" variant="secondary">I already have an account</Button>}
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
            alt="Modern house exterior at dusk"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lift"
          />
        </Container>
      </section>

      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="How it works" title="Four simple steps" align="center" />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="card p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-accent-50 text-accent-600"><Icon className="size-5" aria-hidden /></span>
                  <span className="font-display text-3xl font-semibold text-sand-300">0{i + 1}</span>
                </div>
                <h2 className="mt-5 font-semibold">{title}</h2>
                <p className="mt-1.5 text-sm text-ink-500">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
