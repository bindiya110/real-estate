import { useState } from 'react';
import { cn, initials, sizedImage } from '../../utils/format';

const SIZES = { xs: 'size-7 text-[10px]', sm: 'size-9 text-xs', md: 'size-12 text-sm', lg: 'size-16 text-lg', xl: 'size-24 text-2xl' };

export default function Avatar({ src, name = '', size = 'md', className }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-ink-100 font-semibold text-ink-700', SIZES[size], className)}>
      {showImage ? (
        <img src={sizedImage(src, 200)} alt={name} className="size-full object-cover" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden>{initials(name) || '?'}</span>
      )}
    </span>
  );
}
