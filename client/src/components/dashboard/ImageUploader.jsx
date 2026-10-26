import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2 } from 'lucide-react';
import uploadService from '../../services/uploadService';
import { getErrorMessage } from '../../services/api';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGES, MAX_IMAGE_MB } from '../../constants';
import { cn, sizedImage } from '../../utils/format';

/**
 * Uploads images immediately (with progress) and keeps an ordered list of { _id, url }.
 * The first image is the cover photo. Removing an image unlinks it from the form; files that
 * were uploaded in this session are also deleted from storage.
 */
export default function ImageUploader({ value = [], onChange, error }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [sessionUploads] = useState(() => new Set());

  const handleFiles = async (fileList) => {
    const files = [...fileList];
    if (!files.length) return;

    const remaining = MAX_IMAGES - value.length;
    if (remaining <= 0) {
      toast.error(`You can upload up to ${MAX_IMAGES} images`);
      return;
    }
    const valid = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) toast.error(`${file.name}: only JPEG, PNG or WebP images are allowed`);
      else if (file.size > MAX_IMAGE_MB * 1024 * 1024) toast.error(`${file.name} is larger than ${MAX_IMAGE_MB} MB`);
      else valid.push(file);
    }
    if (files.length > remaining) toast.error(`Only ${remaining} more image${remaining === 1 ? '' : 's'} can be added`);
    if (!valid.length) return;

    setProgress(0);
    try {
      const res = await uploadService.propertyImages(valid, setProgress);
      res.data.forEach((u) => sessionUploads.add(u._id));
      onChange([...value, ...res.data.map((u) => ({ _id: u._id, url: u.url }))]);
      toast.success(res.message);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (image) => {
    onChange(value.filter((i) => i._id !== image._id));
    if (sessionUploads.has(image._id)) {
      sessionUploads.delete(image._id);
      uploadService.deletePropertyImages([image._id]).catch(() => {});
    }
  };

  const move = (index, delta) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };

  const uploading = progress !== null;

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) handleFiles(e.dataTransfer.files); }}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-accent-500 bg-accent-50' : error ? 'border-red-300 bg-red-50/40' : 'border-sand-300 bg-sand-50',
        )}
      >
        <span className="grid size-12 place-items-center rounded-full bg-white text-accent-600 shadow-xs"><ImagePlus className="size-6" aria-hidden /></span>
        <p className="mt-3 font-medium">Drag and drop photos here</p>
        <p className="mt-1 text-sm text-ink-400">JPEG, PNG or WebP · up to {MAX_IMAGE_MB} MB each · max {MAX_IMAGES} photos</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || value.length >= MAX_IMAGES}
          className="mt-4 rounded-lg border border-sand-300 bg-white px-4 py-2 text-sm font-medium hover:bg-sand-50 disabled:opacity-50"
        >
          Choose files
        </button>
        <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES.join(',')} multiple className="sr-only" onChange={(e) => handleFiles(e.target.files)} aria-label="Upload property photos" />

        {uploading && (
          <div className="mt-5 w-full max-w-xs" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
            <div className="h-2 overflow-hidden rounded-full bg-sand-200">
              <div className="h-full rounded-full bg-accent-500 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-ink-500">{progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}</p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">{error}</p>}

      {value.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((image, i) => (
            <li key={image._id} className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-sand-200 bg-sand-100">
              <img src={sizedImage(image.url, 400)} alt={`Property photo ${i + 1}`} className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-ink-900 px-2 py-0.5 text-[11px] font-medium text-white">
                  <Star className="size-3 fill-current" aria-hidden /> Cover
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-linear-to-t from-ink-950/70 to-transparent p-2">
                <div className="flex gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-7 place-items-center rounded-md bg-white/90 text-ink-800 disabled:opacity-40" aria-label="Move photo earlier">
                    <ArrowLeft className="size-3.5" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} className="grid size-7 place-items-center rounded-md bg-white/90 text-ink-800 disabled:opacity-40" aria-label="Move photo later">
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
                <button type="button" onClick={() => remove(image)} className="grid size-7 place-items-center rounded-md bg-white/90 text-red-600 hover:bg-white" aria-label={`Remove photo ${i + 1}`}>
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
