import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Images, X } from 'lucide-react';
import { cn, sizedImage } from '../../utils/format';

function Lightbox({ images, index, onClose, onChange, title }) {
  const prev = useCallback(() => onChange((index - 1 + images.length) % images.length), [index, images.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % images.length), [index, images.length, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-50 flex flex-col bg-ink-950/95">
      <div className="flex items-center justify-between p-4 text-white">
        <span className="text-sm">{index + 1} / {images.length}</span>
        <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10" aria-label="Close gallery" autoFocus>
          <X className="size-6" />
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 pb-6">
        <img src={sizedImage(images[index].url, 2000)} alt={`${title} - photo ${index + 1}`} className="max-h-full max-w-full rounded-lg object-contain" />
        {images.length > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Previous photo">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" onClick={next} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Next photo">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

/** Main image with thumbnails; opens a keyboard-navigable lightbox. */
export default function PropertyGallery({ images = [], title }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return <div className="grid aspect-[16/9] place-items-center rounded-xl bg-sand-200 text-ink-400">No photos available</div>;
  }

  const side = images.slice(1, 5);
  // Tile spans for the right-hand side of the mosaic, depending on how many extra photos exist.
  const sideSpans = {
    1: ['col-span-2 row-span-2'],
    2: ['col-span-2', 'col-span-2'],
    3: ['col-span-2', '', ''],
    4: ['', '', '', ''],
  }[side.length] ?? [];

  return (
    <div>
      {/* Desktop mosaic */}
      <div className="hidden gap-2 overflow-hidden rounded-xl md:grid md:h-[480px] md:grid-cols-4 md:grid-rows-2">
        <button type="button" onClick={() => { setActive(0); setLightbox(true); }} className={cn('relative row-span-2 overflow-hidden', side.length ? 'col-span-2' : 'col-span-4')} aria-label="Open photo 1">
          <img src={sizedImage(images[0].url, 1400)} alt={title} className="size-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
        </button>
        {side.map((img, i) => (
          <button key={img.url} type="button" onClick={() => { setActive(i + 1); setLightbox(true); }} className={cn('relative overflow-hidden', sideSpans[i])} aria-label={`Open photo ${i + 2}`}>
            <img src={sizedImage(img.url, 800)} alt="" className="size-full object-cover transition-transform duration-500 hover:scale-[1.03]" loading="lazy" />
            {i === side.length - 1 && images.length > 5 && (
              <span className="absolute inset-0 grid place-items-center bg-ink-950/45 text-sm font-semibold text-white">+{images.length - 5} more</span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <button type="button" className="relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-sand-200" onClick={() => setLightbox(true)} aria-label="Open gallery">
          <img src={sizedImage(images[active].url, 1000)} alt={title} className="size-full object-cover" />
          <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/70 px-3 py-1 text-xs font-medium text-white">
            <Images className="size-3.5" aria-hidden /> {active + 1}/{images.length}
          </span>
        </button>
        {images.length > 1 && (
          <div className="scrollbar-none mt-2 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActive(i)}
                className={cn('h-16 w-20 shrink-0 overflow-hidden rounded-lg ring-2', i === active ? 'ring-accent-500' : 'ring-transparent opacity-70')}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === active}
              >
                <img src={sizedImage(img.url, 200)} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={() => setLightbox(true)} className="mt-3 hidden items-center gap-2 text-sm font-medium text-ink-700 hover:text-ink-900 md:inline-flex">
        <Images className="size-4" aria-hidden /> View all {images.length} photos
      </button>

      {lightbox && <Lightbox images={images} index={active} onChange={setActive} onClose={() => setLightbox(false)} title={title} />}
    </div>
  );
}
