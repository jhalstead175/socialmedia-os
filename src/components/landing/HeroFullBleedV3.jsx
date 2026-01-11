import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleCopy } from '@/hooks/useRoleCopy';
import { useClerkAuth } from '@/api/clerkClient';
import { createPageUrl } from '@/utils';

export function HeroFullBleedV3({
  heroImageUrl = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2832&auto=format&fit=crop",
  onSecondary,
}) {
  const { copy } = useRoleCopy();
  const { isAuthenticated } = useClerkAuth();
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    if (isAuthenticated) {
      navigate(createPageUrl('Dashboard'));
    } else {
      navigate(createPageUrl('Signin'));
    }
  };

  const handleSecondaryCTA = () => {
    if (onSecondary) {
      onSecondary();
    } else {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative isolate min-h-[68vh] overflow-hidden">
      {/* Full-bleed image */}
      <img src={heroImageUrl} alt="Social media workspace" className="absolute inset-0 h-full w-full object-cover" />

      {/* Dark gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F14] via-[#0B0F14]/80 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Early Access Badge */}
          <div className="inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium mb-4 text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" />
            </span>
            Early Access — Join professionals using SoshOps
          </div>

          {/* Dynamic Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl tracking-tight font-semibold text-zinc-100">
            {copy.headline}
          </h1>

          {/* Dynamic Subtitle */}
          <p className="mt-4 text-base md:text-lg leading-relaxed text-zinc-400">
            {copy.sub}
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrimaryCTA}
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm md:text-base font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:opacity-90 focus:outline-none focus-visible:ring-2 transition-opacity bg-blue-600 text-white"
            >
              {isAuthenticated ? 'Go to Dashboard' : copy.primaryCTA}
            </button>

            <button
              onClick={handleSecondaryCTA}
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-5 py-3 text-sm md:text-base font-semibold hover:opacity-80 focus:outline-none focus-visible:ring-2 transition-opacity text-zinc-100"
            >
              {copy.secondaryCTA}
            </button>
          </div>

          {/* Micro-copy */}
          <p className="mt-4 text-xs text-zinc-400">
            No credit card required. Cancel anytime. Private by design.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroFullBleedV3;
