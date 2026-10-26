import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/format';
import EmailVerificationBanner from './EmailVerificationBanner';

/** Shared responsive shell for the user dashboard and admin panel. */
export default function DashboardShell({ title, nav, footerLink }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    // Leave the protected area first so the route guard doesn't record it as a "return to" page.
    navigate('/', { replace: true });
    await logout();
    toast.success('You have been logged out');
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sand-200 px-5">
        <Logo />
        <button type="button" className="rounded-lg p-2 hover:bg-sand-100 lg:hidden" onClick={() => setOpen(false)} aria-label="Close sidebar">
          <X className="size-5" />
        </button>
      </div>
      <p className="px-5 pt-5 pb-2 text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">{title}</p>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4" aria-label={title}>
        {nav.map((item) =>
          item.section ? (
            <p key={item.section} className="px-2 pt-4 pb-1.5 text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase">{item.section}</p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive ? 'bg-ink-900 text-white' : 'text-ink-600 hover:bg-sand-100 hover:text-ink-900',
                )
              }
            >
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && <span className="rounded-full bg-accent-500 px-1.5 text-[11px] font-semibold text-white">{item.badge}</span>}
            </NavLink>
          ),
        )}
      </nav>
      <div className="border-t border-sand-200 p-3">
        {footerLink && (
          <Link to={footerLink.to} className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-sand-100 hover:text-ink-900">
            <footerLink.icon className="size-4.5" aria-hidden /> {footerLink.label}
          </Link>
        )}
        <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 hover:bg-sand-100 hover:text-ink-900">
          <ExternalLink className="size-4.5" aria-hidden /> View website
        </Link>
        <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
          <LogOut className="size-4.5" aria-hidden /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-sand-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sand-200 bg-white lg:block">{sidebar}</aside>

      <div className={cn('fixed inset-0 z-50 lg:hidden', open ? 'visible' : 'invisible')}>
        <div className={cn('absolute inset-0 bg-ink-950/40 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={() => setOpen(false)} aria-hidden />
        <aside className={cn('absolute inset-y-0 left-0 w-[min(18rem,85vw)] bg-white shadow-lift transition-transform duration-200', open ? 'translate-x-0' : '-translate-x-full')}>
          {sidebar}
        </aside>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-sand-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" className="-ml-2 rounded-lg p-2 hover:bg-sand-100 lg:hidden" onClick={() => setOpen(true)} aria-label="Open sidebar">
            <Menu className="size-5" />
          </button>
          <div className="hidden text-sm text-ink-400 lg:block">Welcome back, <span className="font-medium text-ink-800">{user?.name}</span></div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-tight font-medium">{user?.name}</p>
              <p className="text-xs text-ink-400 capitalize">{user?.role}</p>
            </div>
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
          </div>
        </header>
        <main id="main" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <EmailVerificationBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
