import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, LayoutDashboard, LogOut, Menu, Shield, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Container from '../common/Container';
import Logo from '../common/Logo';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/format';

const NAV_LINKS = [
  { to: '/buy', label: 'Buy' },
  { to: '/rent', label: 'Rent' },
  { to: '/sell', label: 'Sell' },
  { to: '/agents', label: 'Agents' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item = 'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-700 hover:bg-sand-100 hover:text-ink-900';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-sand-200 bg-white py-1 pr-3 pl-1 hover:border-sand-300"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={user.avatar} name={user.name} size="xs" />
        <span className="max-w-28 truncate text-sm font-medium">{user.name.split(' ')[0]}</span>
        <ChevronDown className={cn('size-4 text-ink-400 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div role="menu" className="animate-fade-in absolute right-0 z-40 mt-2 w-60 rounded-xl border border-sand-200 bg-white p-1.5 shadow-lift">
          <div className="border-b border-sand-200 px-3 pt-2 pb-3">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-ink-400">{user.email}</p>
          </div>
          <div className="py-1" onClick={() => setOpen(false)}>
            {user.role === 'admin' && (
              <Link role="menuitem" to="/admin" className={item}><Shield className="size-4" /> Admin panel</Link>
            )}
            <Link role="menuitem" to="/dashboard" className={item}><LayoutDashboard className="size-4" /> Dashboard</Link>
            <Link role="menuitem" to="/dashboard/favorites" className={item}><Heart className="size-4" /> Favorites</Link>
            <Link role="menuitem" to="/dashboard/profile" className={item}><User className="size-4" /> Profile</Link>
            <button role="menuitem" type="button" onClick={onLogout} className={cn(item, 'text-red-600 hover:text-red-700')}>
              <LogOut className="size-4" /> Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar({ transparent = false }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    navigate('/', { replace: true });
    await logout();
    toast.success('You have been logged out');
  };

  const solid = !transparent || scrolled;

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-colors duration-200',
        solid ? 'border-b border-sand-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85' : 'bg-transparent',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-4 lg:h-18">
        <Logo inverted={!solid} />

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive
                  ? (solid ? 'text-accent-600' : 'text-white underline underline-offset-8')
                  : solid ? 'text-ink-700 hover:bg-sand-100 hover:text-ink-900' : 'text-white/90 hover:bg-white/10 hover:text-white')
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Button to="/dashboard/properties/new" size="sm" variant="dark">List a property</Button>
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm" className={cn(!solid && 'text-white! hover:bg-white/10!')}>Log in</Button>
              <Button to="/register" size="sm">Sign up</Button>
            </>
          )}
        </div>

        <button
          type="button"
          className={cn('-mr-2 rounded-lg p-2 lg:hidden', solid ? 'text-ink-800 hover:bg-sand-100' : 'text-white hover:bg-white/10')}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-drawer"
        >
          <Menu className="size-6" />
        </button>
      </Container>

      {/* Mobile drawer */}
      <div className={cn('fixed inset-0 z-50 lg:hidden', mobileOpen ? 'visible' : 'invisible')} aria-hidden={!mobileOpen}>
        <div className={cn('absolute inset-0 bg-ink-950/40 transition-opacity', mobileOpen ? 'opacity-100' : 'opacity-0')} onClick={() => setMobileOpen(false)} />
        <aside
          id="mobile-drawer"
          className={cn(
            'absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-white shadow-lift transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : 'translate-x-full',
          )}
          aria-label="Mobile menu"
        >
          <div className="flex h-16 items-center justify-between border-b border-sand-200 px-4">
            <Logo />
            <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 hover:bg-sand-100" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-3" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn('block rounded-lg px-3 py-2.5 text-base font-medium', isActive ? 'bg-accent-50 text-accent-700' : 'text-ink-800 hover:bg-sand-100')}
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <div className="mt-3 border-t border-sand-200 pt-3">
                {user.role === 'admin' && <NavLink to="/admin" className="block rounded-lg px-3 py-2.5 font-medium text-ink-800 hover:bg-sand-100">Admin panel</NavLink>}
                <NavLink to="/dashboard" className="block rounded-lg px-3 py-2.5 font-medium text-ink-800 hover:bg-sand-100">Dashboard</NavLink>
                <NavLink to="/dashboard/favorites" className="block rounded-lg px-3 py-2.5 font-medium text-ink-800 hover:bg-sand-100">Favorites</NavLink>
                <NavLink to="/dashboard/profile" className="block rounded-lg px-3 py-2.5 font-medium text-ink-800 hover:bg-sand-100">Profile</NavLink>
              </div>
            )}
          </nav>
          <div className="space-y-2 border-t border-sand-200 p-4">
            {user ? (
              <>
                <Button to="/dashboard/properties/new" className="w-full" variant="dark">List a property</Button>
                <Button variant="secondary" className="w-full" icon={LogOut} onClick={handleLogout}>Log out</Button>
              </>
            ) : (
              <>
                <Button to="/register" className="w-full">Create account</Button>
                <Button to="/login" variant="secondary" className="w-full">Log in</Button>
              </>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
