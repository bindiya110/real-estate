import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import CheckboxGroup from '../forms/CheckboxGroup';
import { AMENITIES, AVAILABILITY, FURNISHING, PROPERTY_TYPES } from '../../constants';
import { cn } from '../../utils/format';

function Section({ title, children }) {
  return (
    <div className="border-b border-sand-200 py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-sm font-semibold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

function Pills({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = String(value ?? '') === String(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : opt.value)}
            className={cn(
              'h-9 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors',
              active ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-300 bg-white text-ink-700 hover:border-ink-200',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Text/number inputs keep local state and push to the URL after a short debounce. */
function DebouncedInput({ value, onCommit, ...props }) {
  const [local, setLocal] = useState(value ?? '');
  const debounced = useDebounce(local, 500);

  useEffect(() => setLocal(value ?? ''), [value]);
  useEffect(() => {
    if (String(debounced) !== String(value ?? '')) onCommit(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return <input value={local} onChange={(e) => setLocal(e.target.value)} className="field-control" {...props} />;
}

export default function PropertyFilters({ filters, setFilters, clearFilters, listingType, categories = [] }) {
  const rent = listingType === 'rent';
  const bedOptions = [1, 2, 3, 4, 5].map((n) => ({ value: n, label: `${n}+` }));
  const bathOptions = [1, 2, 3, 4].map((n) => ({ value: n, label: `${n}+` }));

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600 hover:underline">
          <RotateCcw className="size-3.5" aria-hidden /> Reset
        </button>
      </div>

      <Section title="Location">
        <div className="space-y-2.5">
          <label htmlFor="f-city" className="sr-only">City</label>
          <DebouncedInput id="f-city" placeholder="City (e.g. Pune)" value={filters.city} onCommit={(v) => setFilters({ city: v.trim() || undefined })} />
          <label htmlFor="f-location" className="sr-only">Area or locality</label>
          <DebouncedInput id="f-location" placeholder="Area, locality or state" value={filters.location} onCommit={(v) => setFilters({ location: v.trim() || undefined })} />
        </div>
      </Section>

      <Section title={rent ? 'Monthly rent (₹)' : 'Price (₹)'}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="f-min" className="mb-1 block text-xs text-ink-400">Min</label>
            <DebouncedInput id="f-min" type="number" inputMode="numeric" min="0" placeholder="0" value={filters.minPrice} onCommit={(v) => setFilters({ minPrice: v || undefined })} />
          </div>
          <div>
            <label htmlFor="f-max" className="mb-1 block text-xs text-ink-400">Max</label>
            <DebouncedInput id="f-max" type="number" inputMode="numeric" min="0" placeholder="Any" value={filters.maxPrice} onCommit={(v) => setFilters({ maxPrice: v || undefined })} />
          </div>
        </div>
      </Section>

      <Section title="Property type">
        <CheckboxGroup options={PROPERTY_TYPES} value={filters.propertyType ?? []} onChange={(v) => setFilters({ propertyType: v })} />
      </Section>

      {categories.length > 0 && (
        <Section title="Category">
          <Pills label="Category" options={categories.map((c) => ({ value: c.slug, label: c.name }))} value={filters.category} onChange={(v) => setFilters({ category: v })} />
        </Section>
      )}

      <Section title="Bedrooms">
        <Pills label="Bedrooms" options={bedOptions} value={filters.bedrooms} onChange={(v) => setFilters({ bedrooms: v })} />
      </Section>

      <Section title="Bathrooms">
        <Pills label="Bathrooms" options={bathOptions} value={filters.bathrooms} onChange={(v) => setFilters({ bathrooms: v })} />
      </Section>

      <Section title="Minimum area (sq ft)">
        <label htmlFor="f-area" className="sr-only">Minimum area</label>
        <DebouncedInput id="f-area" type="number" inputMode="numeric" min="0" placeholder="e.g. 1000" value={filters.minArea} onCommit={(v) => setFilters({ minArea: v || undefined })} />
      </Section>

      <Section title="Furnishing">
        <CheckboxGroup options={FURNISHING} value={filters.furnishing ?? []} onChange={(v) => setFilters({ furnishing: v })} />
      </Section>

      {rent && (
        <Section title="Availability">
          <Pills label="Availability" options={AVAILABILITY.filter((a) => ['available', 'rented'].includes(a.value))} value={filters.availabilityStatus} onChange={(v) => setFilters({ availabilityStatus: v })} />
        </Section>
      )}

      <Section title="Amenities">
        <CheckboxGroup options={AMENITIES} value={filters.amenities ?? []} onChange={(v) => setFilters({ amenities: v })} />
      </Section>
    </div>
  );
}
