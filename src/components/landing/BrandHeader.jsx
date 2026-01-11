
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import Logo from '../Logo';

export function BrandHeaderV2({
  links = [
    { label: "Features", href: createPageUrl("Landing") + "#features" },
    { label: "Templates", href: createPageUrl("Templates") },
    { label: "Pricing", href: createPageUrl("Landing") + "#pricing" },
    { label: "FAQ", href: createPageUrl("FAQ") },
  ],
  onCta = () => {},
}) {
  const [open, setOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-[color:rgba(10,12,20,0.7)] backdrop-blur supports-[backdrop-filter]:bg-[color:rgba(10,12,20,0.5)]">
      <div className="mx-auto max-w-7xl px-6 md:px-8 h-14 flex items-center justify-between">
        <Link to={createPageUrl("Landing")} className="flex items-center" aria-label="SoshOps Home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-zinc-300 hover:text-zinc-100">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <button onClick={onCta} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            Get Started Free
          </button>
        </div>
        <button className="md:hidden rounded-lg border border-zinc-700/80 p-2 text-zinc-200" aria-expanded={open} aria-controls="mnav2" aria-label="Toggle Menu" onClick={() => setOpen((v) => !v)}>
          <span aria-hidden>≡</span>
        </button>
      </div>
      {open && (
        <div id="mnav2" className="md:hidden border-t border-zinc-800/60">
          <div className="mx-auto max-w-7xl px-6 md:px-8 py-3 flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-sm text-zinc-300 hover:text-zinc-100">
                {l.label}
              </a>
            ))}
            <button onClick={onCta} className="mt-1 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default BrandHeaderV2;
