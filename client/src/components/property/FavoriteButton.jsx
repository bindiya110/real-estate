import { Heart } from 'lucide-react';
import useFavorites from '../../hooks/useFavorites';
import { cn } from '../../utils/format';

export default function FavoriteButton({ propertyId, className, withLabel = false }) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(propertyId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(propertyId);
      }}
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Save to favorites'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full transition-colors',
        withLabel ? 'h-10 border border-sand-300 bg-white px-4 text-sm font-medium hover:bg-sand-50' : 'size-9 bg-white/90 shadow-xs backdrop-blur hover:bg-white',
        className,
      )}
    >
      <Heart className={cn('size-4.5 transition-colors', active ? 'fill-accent-500 text-accent-500' : 'text-ink-700')} aria-hidden />
      {withLabel && (active ? 'Saved' : 'Save')}
    </button>
  );
}
