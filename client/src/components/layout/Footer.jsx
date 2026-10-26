import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone } from 'lucide-react';
import Container from '../common/Container';
import Logo from '../common/Logo';
import NewsletterForm from './NewsletterForm';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';

const SOCIAL_PATHS = {
  facebook: 'M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.6c0-.4.3-.6.6-.6Z',
  instagram: 'M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3c-2.4 0-2.7 0-3.7.1C5.6 3.2 3.2 5.6 3.1 8.3 3 9.3 3 9.6 3 12s0 2.7.1 3.7c.1 2.7 2.5 5.1 5.2 5.2 1 .1 1.3.1 3.7.1s2.7 0 3.7-.1c2.7-.1 5.1-2.5 5.2-5.2.1-1 .1-1.3.1-3.7s0-2.7-.1-3.7c-.1-2.7-2.5-5.1-5.2-5.2C14.7 3 14.4 3 12 3Z',
  linkedin: 'M6.5 8.5h-3V20h3V8.5ZM5 3.5a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.5 13.4c0-3-1.6-5.1-4.4-5.1-1.4 0-2.4.7-2.9 1.5V8.5h-3V20h3v-6c0-1.5.6-2.8 2.2-2.8s2.1 1.3 2.1 2.9V20h3v-6.6Z',
  twitter: 'M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5Z',
};

const COLUMNS = [
  { title: 'Explore', links: [['/buy', 'Buy a home'], ['/rent', 'Rent a home'], ['/sell', 'Sell or list'], ['/agents', 'Find an agent']] },
  { title: 'Company', links: [['/about', 'About us'], ['/contact', 'Contact'], ['/faq', 'FAQ']] },
  { title: 'Legal', links: [['/privacy', 'Privacy policy'], ['/terms', 'Terms & conditions']] },
];

export default function Footer() {
  const { data } = useQuery({ queryKey: queryKeys.content.settings, queryFn: contentService.settings, staleTime: 10 * 60_000 });
  const settings = data?.data;
  const socials = Object.entries(settings?.socialLinks ?? {}).filter(([, url]) => url);

  return (
    <footer className="bg-ink-900 text-ink-200">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo inverted />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-300">
              {settings?.tagline || 'Find a place that feels like home'}. Verified listings, transparent pricing and agents you can trust.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {settings?.address && (
                <li className="flex gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-accent-300" aria-hidden />{settings.address}</li>
              )}
              {settings?.contactPhone && (
                <li><a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="flex gap-2.5 hover:text-white"><Phone className="mt-0.5 size-4 text-accent-300" aria-hidden />{settings.contactPhone}</a></li>
              )}
              {settings?.contactEmail && (
                <li><a href={`mailto:${settings.contactEmail}`} className="flex gap-2.5 hover:text-white"><Mail className="mt-0.5 size-4 text-accent-300" aria-hidden />{settings.contactEmail}</a></li>
              )}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-sm font-semibold text-white">{col.title}</h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map(([to, label]) => (
                    <li key={to}><Link to={to} className="text-ink-300 hover:text-white">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-sm font-semibold text-white">Get new listings in your inbox</h2>
            <p className="mt-2 mb-4 text-sm text-ink-300">A short weekly digest of fresh homes and price drops. Unsubscribe anytime.</p>
            <NewsletterForm dark />
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-start justify-between gap-4 border-t border-white/10 pt-6 text-sm text-ink-400 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {settings?.siteName || 'EstateHub'}. All rights reserved.</p>
          {socials.length > 0 && (
            <ul className="flex gap-2">
              {socials.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer" aria-label={name} className="grid size-9 place-items-center rounded-full bg-white/5 text-ink-200 hover:bg-white/15 hover:text-white">
                    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden><path d={SOCIAL_PATHS[name]} /></svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </footer>
  );
}
