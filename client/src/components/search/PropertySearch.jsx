import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import Button from '../common/Button';
import { BEDROOM_OPTIONS, PROPERTY_TYPES, RENT_PRICE_PRESETS, SALE_PRICE_PRESETS } from '../../constants';
import { cn } from '../../utils/format';

const TABS = [
  { value: 'buy', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'sell', label: 'Sell' },
];

function Select({ id, label, value, onChange, children }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink-400">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="w-full cursor-pointer appearance-none truncate bg-transparent text-sm font-medium text-ink-900 focus:outline-none">
        {children}
      </select>
    </div>
  );
}

/** Hero search: Buy/Rent tabs build a URL for the listing pages; Sell links to the listing flow. */
export default function PropertySearch({ className }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('buy');
  const [values, setValues] = useState({ location: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '' });
  const set = (key) => (value) => setValues((v) => ({ ...v, [key]: value }));
  const presets = tab === 'rent' ? RENT_PRICE_PRESETS : SALE_PRICE_PRESETS;

  const submit = (e) => {
    e.preventDefault();
    if (tab === 'sell') {
      navigate('/sell');
      return;
    }
    const params = new URLSearchParams();
    Object.entries(values).forEach(([k, v]) => v && params.set(k, v));
    navigate(`/${tab}${params.size ? `?${params}` : ''}`);
  };

  const switchTab = (value) => {
    setTab(value);
    setValues((v) => ({ ...v, minPrice: '', maxPrice: '' }));
  };

  return (
    <div className={cn('w-full max-w-4xl', className)}>
      <div role="tablist" aria-label="Search type" className="inline-flex rounded-t-xl bg-white/95 p-1.5 pb-0 backdrop-blur">
        {TABS.map((t) => (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={tab === t.value}
            onClick={() => switchTab(t.value)}
            className={cn(
              'relative rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors',
              tab === t.value ? 'text-ink-900 after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:bg-accent-500' : 'text-ink-400 hover:text-ink-800',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="rounded-xl rounded-tl-none bg-white p-3 shadow-lift sm:p-4" role="search">
        {tab === 'sell' ? (
          <div className="flex flex-col gap-4 p-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Sell or rent out your property</p>
              <p className="text-sm text-ink-500">Create a listing in minutes. Our team reviews every listing before it goes live.</p>
            </div>
            <Button type="submit" size="lg">List your property</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-[1.6fr_1fr_1fr_1fr_0.8fr_auto] md:items-center md:gap-0 md:divide-x md:divide-sand-200">
            <div className="col-span-2 rounded-lg border border-sand-200 px-3 py-2 md:col-span-1 md:border-0 md:py-1">
              <label htmlFor="hero-location" className="mb-1 block text-xs font-medium text-ink-400">Location</label>
              <input
                id="hero-location"
                value={values.location}
                onChange={(e) => set('location')(e.target.value)}
                placeholder="City, area or locality"
                className="w-full bg-transparent text-sm font-medium text-ink-900 placeholder:font-normal placeholder:text-ink-300 focus:outline-none"
              />
            </div>
            <div className="rounded-lg border border-sand-200 px-3 py-2 md:border-0 md:py-1">
              <Select id="hero-type" label="Property type" value={values.propertyType} onChange={set('propertyType')}>
                <option value="">Any type</option>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </div>
            <div className="rounded-lg border border-sand-200 px-3 py-2 md:border-0 md:py-1">
              <Select id="hero-min" label="Min price" value={values.minPrice} onChange={set('minPrice')}>
                <option value="">No min</option>
                {presets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div className="rounded-lg border border-sand-200 px-3 py-2 md:border-0 md:py-1">
              <Select id="hero-max" label="Max price" value={values.maxPrice} onChange={set('maxPrice')}>
                <option value="">No max</option>
                {presets.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div className="rounded-lg border border-sand-200 px-3 py-2 md:border-0 md:py-1">
              <Select id="hero-beds" label="Bedrooms" value={values.bedrooms} onChange={set('bedrooms')}>
                <option value="">Any</option>
                {BEDROOM_OPTIONS.map((b) => <option key={b} value={b}>{b}+</option>)}
              </Select>
            </div>
            <div className="col-span-2 md:col-span-1 md:pl-3">
              <Button type="submit" size="lg" icon={Search} className="w-full">Search</Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
