import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export default function Logo({ inverted = false, className }) {
  return (
    <Link to="/" className={cn('inline-flex items-center gap-2.5', className)} aria-label="EstateHub home">
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden>
        <rect width="32" height="32" rx="8" fill={inverted ? '#fff' : '#15233f'} />
        <path d="M8 15.5 16 9l8 6.5V24a1 1 0 0 1-1 1h-4.5v-5.5h-5V25H9a1 1 0 0 1-1-1z" fill={inverted ? '#15233f' : '#fff'} />
        <circle cx="23.5" cy="9.5" r="2.5" fill="#c0612f" />
      </svg>
      <span className={cn('font-display text-xl font-semibold', inverted ? 'text-white' : 'text-ink-900')}>EstateHub</span>
    </Link>
  );
}
