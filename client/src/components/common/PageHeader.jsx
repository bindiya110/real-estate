import Container from './Container';
import Breadcrumbs from './Breadcrumbs';

/** Title band used at the top of public inner pages. */
export default function PageHeader({ title, description, breadcrumbs, children }) {
  return (
    <section className="border-b border-sand-200 bg-sand-100/70">
      <Container className="py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        <h1 className="font-display text-3xl font-semibold sm:text-4xl lg:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-base text-ink-500 sm:text-lg">{description}</p>}
        {children}
      </Container>
    </section>
  );
}
