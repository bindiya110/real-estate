import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Save, Send } from 'lucide-react';
import InputField from '../forms/InputField';
import SelectField from '../forms/SelectField';
import TextAreaField from '../forms/TextAreaField';
import CheckboxGroup from '../forms/CheckboxGroup';
import Button from '../common/Button';
import ImageUploader from './ImageUploader';
import contentService from '../../services/contentService';
import queryKeys from '../../hooks/queryKeys';
import { STEP_FIELDS, emptyProperty, formToPayload, fullPropertySchema } from '../../schemas/propertySchema';
import {
  AMENITIES, AREA_UNITS, AVAILABILITY, CURRENCIES, FURNISHING, LISTING_TYPES, PROPERTY_TYPES, labelFor,
} from '../../constants';
import { cn, formatArea, formatPrice, sizedImage } from '../../utils/format';

const STEPS = ['Basic details', 'Price & location', 'Specifications', 'Photos', 'Review'];

function Stepper({ step, onJump, maxReached }) {
  return (
    <ol className="mb-8 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Form progress">
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => i <= maxReached && onJump(i)}
              disabled={i > maxReached}
              aria-current={current ? 'step' : undefined}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span className={cn(
                'grid size-8 place-items-center rounded-full text-sm font-semibold',
                current ? 'bg-accent-500 text-white' : done ? 'bg-ink-900 text-white' : 'border border-sand-300 bg-white text-ink-400',
              )}
              >
                {done ? <Check className="size-4" aria-hidden /> : i + 1}
              </span>
              <span className={cn('text-sm font-medium', current ? 'text-ink-900' : 'text-ink-400', !current && 'hidden sm:inline')}>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-6 bg-sand-300 sm:w-10" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2.5 text-sm">
      <dt className="text-ink-400">{label}</dt>
      <dd className="text-right font-medium text-ink-800">{value || '–'}</dd>
    </div>
  );
}

/**
 * Multi-step listing form used to create and edit properties.
 * onSubmit(payload, { saveAsDraft }) receives the API payload.
 */
export default function PropertyForm({ initialValues = emptyProperty, onSubmit, submitting, submitLabel = 'Submit for approval', allowDraft = true }) {
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const { data: categoriesRes } = useQuery({ queryKey: queryKeys.content.categories, queryFn: contentService.categories, staleTime: 10 * 60_000 });
  const categories = categoriesRes?.data ?? [];

  const { register, control, handleSubmit, trigger, watch, formState: { errors } } = useForm({
    resolver: zodResolver(fullPropertySchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  });

  const values = watch();
  const isRent = values.listingType === 'rent';
  const err = (name) => errors[name]?.message;

  const goTo = (target) => {
    setStep(target);
    setMaxReached((m) => Math.max(m, target));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) goTo(step + 1);
  };

  const firstInvalidStep = (errs) => STEP_FIELDS.findIndex((fields) => fields.some((f) => errs[f]));

  const submit = (saveAsDraft) =>
    handleSubmit(
      (formValues) => {
        if (!saveAsDraft && formValues.images.length === 0) {
          toast.error('Add at least one photo before submitting');
          goTo(3);
          return;
        }
        onSubmit(formToPayload(formValues), { saveAsDraft });
      },
      (errs) => {
        const target = firstInvalidStep(errs);
        toast.error(saveAsDraft ? 'Fill in the required fields to save a draft' : 'Please fix the highlighted fields');
        if (target >= 0) goTo(target);
      },
    )();

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (step === STEPS.length - 1) submit(false); else next(); }} noValidate>
      <Stepper step={step} onJump={goTo} maxReached={maxReached} />

      <div className="card p-5 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Basic details</h2>
            <InputField label="Listing title" required placeholder="e.g. Sunny 3 BHK with lake view" error={err('title')} {...register('title')} />
            <TextAreaField label="Description" required rows={6} placeholder="Describe the layout, highlights, neighbourhood and nearby amenities" error={err('description')} hint={`${values.description?.length ?? 0}/5000`} {...register('description')} />
            <Controller
              control={control}
              name="listingType"
              render={({ field }) => (
                <fieldset>
                  <legend className="field-label">Listing type<span className="ml-0.5 text-accent-600">*</span></legend>
                  <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                    {LISTING_TYPES.map((t) => (
                      <label key={t.value} className={cn('flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 text-sm font-medium has-focus-visible:outline-2 has-focus-visible:outline-accent-500', field.value === t.value ? 'border-ink-900 bg-ink-900 text-white' : 'border-sand-300 bg-white hover:border-ink-200')}>
                        <input type="radio" className="sr-only" value={t.value} checked={field.value === t.value} onChange={() => field.onChange(t.value)} />
                        {t.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Property type" required placeholder="Select type" options={PROPERTY_TYPES} error={err('propertyType')} {...register('propertyType')} />
              <SelectField label="Category" placeholder="No category" options={categories.map((c) => ({ value: c._id, label: c.name }))} error={err('category')} {...register('category')} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Price & location</h2>
            <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
              <InputField label={isRent ? 'Monthly rent' : 'Sale price'} type="number" inputMode="numeric" min="0" required error={err('price')} hint={values.price ? formatPrice(values.price, values.currency) + (isRent ? ' per month' : '') : undefined} {...register('price')} />
              <SelectField label="Currency" options={CURRENCIES} {...register('currency')} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <InputField label="Country" required autoComplete="country-name" error={err('country')} {...register('country')} />
              <InputField label="State" autoComplete="address-level1" error={err('state')} {...register('state')} />
              <InputField label="City" required autoComplete="address-level2" error={err('city')} {...register('city')} />
              <InputField label="Postal code" autoComplete="postal-code" error={err('postalCode')} {...register('postalCode')} />
            </div>
            <InputField label="Street address / locality" autoComplete="street-address" error={err('address')} {...register('address')} />
            <div>
              <p className="field-label">Map coordinates <span className="font-normal text-ink-400">(optional)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Latitude" type="number" step="any" placeholder="12.9716" error={err('lat')} className="[&_label]:sr-only" {...register('lat')} />
                <InputField label="Longitude" type="number" step="any" placeholder="77.5946" error={err('lng')} className="[&_label]:sr-only" {...register('lng')} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold">Specifications</h2>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <InputField label="Bedrooms" type="number" min="0" required error={err('bedrooms')} {...register('bedrooms')} />
              <InputField label="Bathrooms" type="number" min="0" required error={err('bathrooms')} {...register('bathrooms')} />
              <InputField label="Parking" type="number" min="0" error={err('parkingSpaces')} {...register('parkingSpaces')} />
              <InputField label="Year built" type="number" min="1800" max="2100" error={err('yearBuilt')} {...register('yearBuilt')} />
            </div>
            <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
              <InputField label="Area" type="number" min="0" required error={err('area')} {...register('area')} />
              <SelectField label="Unit" options={AREA_UNITS} {...register('areaUnit')} />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField label="Furnishing" options={FURNISHING} {...register('furnishing')} />
              <SelectField label="Availability" options={AVAILABILITY} {...register('availabilityStatus')} />
            </div>
            <Controller control={control} name="amenities" render={({ field }) => <CheckboxGroup label="Amenities" options={AMENITIES} value={field.value} onChange={field.onChange} columns />} />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Photos</h2>
              <p className="mt-1 text-sm text-ink-500">Bright, real photos get far more inquiries. The first photo is used as the cover.</p>
            </div>
            <Controller control={control} name="images" render={({ field }) => <ImageUploader value={field.value} onChange={field.onChange} error={err('images')} />} />
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold">Review your listing</h2>
            <p className="mt-1 text-sm text-ink-500">Check everything looks right. After you submit, our team will review the listing before it goes live.</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
              <div>
                {values.images[0] ? (
                  <img src={sizedImage(values.images[0].url, 600)} alt="Cover" className="aspect-[4/3] w-full rounded-xl object-cover" />
                ) : (
                  <div className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-red-300 bg-red-50/40 text-sm text-red-600">No photos added</div>
                )}
                <p className="mt-2 text-xs text-ink-400">{values.images.length} photo{values.images.length === 1 ? '' : 's'}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{values.title}</h3>
                <p className="mt-1 text-2xl font-semibold text-accent-600">{formatPrice(values.price, values.currency)}{isRent && '/month'}</p>
                <dl className="mt-4 divide-y divide-sand-200 border-y border-sand-200">
                  <ReviewRow label="Type" value={`${labelFor(PROPERTY_TYPES, values.propertyType)} · ${isRent ? 'For rent' : 'For sale'}`} />
                  <ReviewRow label="Category" value={categories.find((c) => c._id === values.category)?.name} />
                  <ReviewRow label="Location" value={[values.address, values.city, values.state, values.country].filter(Boolean).join(', ')} />
                  <ReviewRow label="Bedrooms / Bathrooms" value={`${values.bedrooms} / ${values.bathrooms}`} />
                  <ReviewRow label="Area" value={formatArea(values.area, values.areaUnit)} />
                  <ReviewRow label="Furnishing" value={labelFor(FURNISHING, values.furnishing)} />
                  <ReviewRow label="Amenities" value={values.amenities.map((a) => labelFor(AMENITIES, a)).join(', ')} />
                </dl>
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-ink-600">{values.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {step > 0 && <Button variant="ghost" icon={ArrowLeft} onClick={() => goTo(step - 1)} disabled={submitting}>Back</Button>}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          {allowDraft && <Button variant="secondary" icon={Save} onClick={() => submit(true)} disabled={submitting}>Save as draft</Button>}
          {step < STEPS.length - 1 ? (
            <Button type="submit" iconRight={ArrowRight}>Continue</Button>
          ) : (
            <Button type="submit" icon={Send} loading={submitting}>{submitLabel}</Button>
          )}
        </div>
      </div>
    </form>
  );
}
