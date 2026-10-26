import Container from '../../components/common/Container';
import PageHeader from '../../components/common/PageHeader';

/** Shared layout for long-form legal documents. sections: [{ heading, paragraphs: [] }] */
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <>
      <PageHeader title={title} description={`Last updated ${updated}`} breadcrumbs={[{ label: 'Home', to: '/' }, { label: title }]} />
      <Container className="max-w-3xl py-12 sm:py-16">
        <p className="text-lg leading-relaxed text-ink-600">{intro}</p>
        {sections.map((s, i) => (
          <section key={s.heading} className="mt-10">
            <h2 className="text-xl font-semibold">{i + 1}. {s.heading}</h2>
            {s.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="mt-3 leading-relaxed text-ink-600">{p}</p>
            ))}
          </section>
        ))}
      </Container>
    </>
  );
}
