import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleCopy } from '@/hooks/useRoleCopy';
import { useClerkAuth } from '@/api/clerkClient';
import { theme } from '@/styles/rezemai.tokens';
import { createPageUrl } from '@/utils';

export function HeroFullBleedV3({
  heroImageUrl = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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
      <img src={heroImageUrl} alt="Professional workspace" className="absolute inset-0 h-full w-full object-cover" />

      {/* Dark gradient for legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-current via-current/80 to-transparent"
        style={{ color: theme.colors.bg }}
      />

      <div className={`relative ${theme.spacing.container} pt-24 pb-16`}>
        <div className="max-w-2xl">
          {/* Early Access Badge */}
          <div
            className={`inline-flex items-center gap-2 ${theme.radius.button} border px-3 py-1 text-xs font-medium mb-4`}
            style={{
              borderColor: `${theme.colors.accent}30`,
              backgroundColor: `${theme.colors.accent}10`,
              color: theme.colors.accent
            }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: theme.colors.accent }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </span>
            Early Access — Join professionals already using Rezemai
          </div>

          {/* Dynamic Headline */}
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl ${theme.typography.headings}`}
            style={{ color: theme.colors.textPrimary }}
          >
            {copy.headline}
          </h1>

          {/* Dynamic Subtitle */}
          <p
            className={`mt-4 text-base md:text-lg ${theme.typography.body}`}
            style={{ color: theme.colors.textSecondary }}
          >
            {copy.sub}
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrimaryCTA}
              className={`inline-flex items-center justify-center ${theme.radius.button} px-5 py-3 text-sm md:text-base font-semibold shadow hover:opacity-90 focus:outline-none focus-visible:ring-2 transition-opacity`}
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.bg,
                boxShadow: theme.shadow.soft
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : copy.primaryCTA}
            </button>

            <button
              onClick={handleSecondaryCTA}
              className={`inline-flex items-center justify-center ${theme.radius.button} border px-5 py-3 text-sm md:text-base font-semibold hover:opacity-80 focus:outline-none focus-visible:ring-2 transition-opacity`}
              style={{
                borderColor: `${theme.colors.textPrimary}20`,
                backgroundColor: `${theme.colors.textPrimary}05`,
                color: theme.colors.textPrimary
              }}
            >
              {copy.secondaryCTA}
            </button>
          </div>

          {/* Micro-copy */}
          <p
            className="mt-4 text-xs"
            style={{ color: theme.colors.textSecondary }}
          >
            No templates. No spam. Private by design.
          </p>
        </div>
      </div>
    </section>
  );
}

export default HeroFullBleedV3;