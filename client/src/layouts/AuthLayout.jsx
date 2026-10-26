import { Outlet } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import Logo from '../components/common/Logo';

const IMAGE = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80';

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 sm:px-10 lg:px-16">
        <Logo />
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </main>
        <p className="text-center text-xs text-ink-400 lg:text-left">© {new Date().getFullYear()} EstateHub</p>
      </div>
      <div className="relative hidden lg:block">
        <img src={IMAGE} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 via-ink-950/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <ShieldCheck className="size-8 text-accent-300" aria-hidden />
          <p className="font-display mt-4 max-w-md text-3xl leading-snug">Every listing is reviewed by our team before it goes live.</p>
          <p className="mt-3 max-w-md text-sm text-white/75">Verified homes, transparent pricing and direct access to trusted agents across India.</p>
        </div>
      </div>
    </div>
  );
}
