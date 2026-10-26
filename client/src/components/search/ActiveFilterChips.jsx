import { X } from 'lucide-react';
import { AMENITIES, AVAILABILITY, FURNISHING, PROPERTY_TYPES, labelFor } from '../../constants';
import { formatPrice } from '../../utils/format';

function describe(key, value, categories) {
  switch (key) {
    case 'q': return `“${value}”`;
    case 'city':
    case 'location': return value;
    case 'propertyType': return labelFor(PROPERTY_TYPES, value);
    case 'furnishing': return labelFor(FURNISHING, value);
    case 'amenities': return labelFor(AMENITIES, value);
    case 'availabilityStatus': return labelFor(AVAILABILITY, value);
    case 'category': return categories?.find((c) => c.slug === value)?.name ?? value;
    case 'minPrice': return `Min ${formatPrice(value)}`;
    case 'maxPrice': return `Max ${formatPrice(value)}`;
    case 'bedrooms': return `${value}+ beds`;
    case 'bathrooms': return `${value}+ baths`;
    case 'minArea': return `${value}+ sq ft`;
    default: return value;
  }
}

/** Removable chips for every active filter, plus "Clear all". */
export default function ActiveFilterChips({ filters, setFilters, clearFilters, categories }) {
  const chips = [];
  Object.entries(filters).forEach(([key, value]) => {
    if (['sort', 'page'].includes(key) || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => chips.push({ key, value: v, label: describe(key, v, categories), remove: () => setFilters({ [key]: value.filter((x) => x !== v) }) }));
    } else {
      chips.push({ key, value, label: describe(key, value, categories), remove: () => setFilters({ [key]: undefined }) });
    }
  });

  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={chip.remove}
          className="inline-flex items-center gap-1.5 rounded-full border border-sand-300 bg-white py-1 pr-2 pl-3 text-xs font-medium text-ink-700 hover:border-ink-300"
          aria-label={`Remove filter ${chip.label}`}
        >
          {chip.label}
          <X className="size-3.5 text-ink-400" aria-hidden />
        </button>
      ))}
      <button type="button" onClick={clearFilters} className="px-2 text-xs font-semibold text-accent-600 hover:underline">
        Clear all
      </button>
    </div>
  );
}
