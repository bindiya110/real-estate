import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../../utils/format';

const VARIANTS = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-xs',
  secondary: 'border border-sand-300 bg-white text-ink-900 hover:border-ink-200 hover:bg-sand-50 shadow-xs',
  dark: 'bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 shadow-xs',
  ghost: 'text-ink-700 hover:bg-sand-100 hover:text-ink-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
  'danger-outline': 'border border-red-200 bg-white text-red-600 hover:bg-red-50',
  link: 'text-accent-600 hover:text-accent-700 underline-offset-4 hover:underline px-0! h-auto!',
};

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4.5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
};

/** Shared button. Pass `to` to render a router Link, or `href` for an external anchor. */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, to, href, type = 'button', icon: Icon, iconRight: IconRight, ...props },
  ref,
) {
  const classes = cn(
    'inline-flex shrink-0 items-center justify-center rounded-lg font-medium whitespace-nowrap transition-colors duration-150',
    'disabled:pointer-events-none disabled:opacity-55',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : Icon && <Icon className="size-4" aria-hidden />}
      {children}
      {IconRight && !loading && <IconRight className="size-4" aria-hidden />}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...props}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
});

export const PrimaryButton = forwardRef((props, ref) => <Button ref={ref} variant="primary" {...props} />);
export const SecondaryButton = forwardRef((props, ref) => <Button ref={ref} variant="secondary" {...props} />);

export default Button;
