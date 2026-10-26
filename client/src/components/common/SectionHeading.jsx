import { cn } from '../../utils/format';

export default function SectionHeading({ eyebrow, title, description, align = 'left', action, className, as: Tag = 'h2' }) {
  const centered = align === 'center';
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:mb-10', !centered && action && 'sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className={cn('max-w-2xl', centered && 'mx-auto text-center')}>
        {eyebrow && <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-accent-600 uppercase">{eyebrow}</p>}
        <Tag className="font-display text-3xl leading-tight font-semibold sm:text-4xl">{title}</Tag>
        {description && <p className="mt-3 text-base leading-relaxed text-ink-500">{description}</p>}
      </div>
      {action && <div className={cn(centered && 'mx-auto')}>{action}</div>}
    </div>
  );
}
