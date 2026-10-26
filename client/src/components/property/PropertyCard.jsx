import { Link } from 'react-router-dom';
import { Bath, BedDouble, MapPin, Ruler } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { Badge } from '../common/StatusBadge';
import { PROPERTY_TYPES, labelFor } from '../../constants';
import { cn, formatArea, formatListingPrice, sizedImage } from '../../utils/format';

function Specs({ property, className }) {
  const items = [
    property.bedrooms > 0 && { icon: BedDouble, label: `${property.bedrooms} Bed${property.bedrooms > 1 ? 's' : ''}` },
    property.bathrooms > 0 && { icon: Bath, label: `${property.bathrooms} Bath${property.bathrooms > 1 ? 's' : ''}` },
    property.area && { icon: Ruler, label: formatArea(property.area, property.areaUnit) },
  ].filter(Boolean);

  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500', className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5">
          <Icon className="size-4 text-ink-300" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}

/** Listing card in grid (default) or horizontal list layout. */
export default function PropertyCard({ property, layout = 'grid', showFavorite = true }) {
  const image = property.images?.[0]?.url;
  const href = `/properties/${property.slug}`;
  const location = [property.address, property.city].filter(Boolean).join(', ');
  const isList = layout === 'list';

  return (
    <article
      className={cn(
        'group card relative flex overflow-hidden transition-shadow duration-200 hover:shadow-lift',
        isList ? 'flex-col sm:flex-row' : 'flex-col',
      )}
    >
      <div className={cn('relative overflow-hidden bg-sand-200', isList ? 'aspect-[4/3] sm:aspect-auto sm:w-72 sm:shrink-0' : 'aspect-[4/3]')}>
        {image ? (
          <img
            src={sizedImage(image, 800)}
            alt={property.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-sm text-ink-400">No photo</div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge tone="dark" className="ring-0">{property.listingType === 'rent' ? 'For rent' : 'For sale'}</Badge>
          {property.featured && <Badge tone="accent" className="bg-accent-500 text-white ring-0">Featured</Badge>}
        </div>
        {showFavorite && <FavoriteButton propertyId={property._id} className="absolute top-3 right-3" />}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="text-xl font-semibold text-ink-900">
          {formatListingPrice(property)}
        </p>
        <h3 className="mt-1 line-clamp-1 text-base font-semibold text-ink-800">
          <Link to={href} className="after:absolute after:inset-0 focus-visible:outline-none" aria-label={`${property.title}, ${formatListingPrice(property)}`}>
            {property.title}
          </Link>
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{location}</span>
        </p>
        <div className={cn('mt-4 flex items-center justify-between gap-2 border-t border-sand-200 pt-4', isList && 'sm:mt-auto')}>
          <Specs property={property} />
          <span className="hidden text-xs font-medium text-ink-400 sm:inline">{labelFor(PROPERTY_TYPES, property.propertyType)}</span>
        </div>
      </div>
    </article>
  );
}

export { Specs as PropertySpecs };
