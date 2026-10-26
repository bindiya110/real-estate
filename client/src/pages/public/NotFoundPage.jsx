import { ArrowLeft, Search } from 'lucide-react';
import Container from '../../components/common/Container';
import Button from '../../components/common/Button';
import useDocumentTitle from '../../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-7xl font-semibold text-accent-500 sm:text-8xl">404</p>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">This address doesn’t exist</h1>
      <p className="mt-3 max-w-md text-ink-500">The page you are looking for may have moved, or the link might be broken. Let’s get you back home.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to="/" icon={ArrowLeft} variant="secondary">Back to home</Button>
        <Button to="/buy" icon={Search}>Browse properties</Button>
      </div>
    </Container>
  );
}
