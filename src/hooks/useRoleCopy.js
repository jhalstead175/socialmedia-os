import { useState, useEffect } from 'react';

const COPY_VARIANTS = {
  default: {
    headline: "Manage Your Social Presence Professionally",
    sub: "SoshOps helps you schedule, publish, and analyze social media content across all platforms from one dashboard.",
    primaryCTA: "Get Started Free",
    secondaryCTA: "See How It Works"
  },
  creator: {
    headline: "Content Scheduling Made Simple",
    sub: "Focus on creating great content while SoshOps handles scheduling and publishing across all your social platforms.",
    primaryCTA: "Start Creating",
    secondaryCTA: "View Features"
  },
  business: {
    headline: "Scale Your Social Media Operations",
    sub: "Professional tools for teams who need to manage multiple accounts, schedule campaigns, and track performance.",
    primaryCTA: "Get Started",
    secondaryCTA: "See Pricing"
  }
};

/**
 * Hook to get copy variants
 * Auto-detects from URL param: ?variant=default|creator|business
 * Falls back to localStorage, then default to "default"
 */
export function useRoleCopy() {
  const [variant, setVariant] = useState(() => {
    // Check URL param first
    const params = new URLSearchParams(window.location.search);
    const urlVariant = params.get('variant');

    if (urlVariant && ['default', 'creator', 'business'].includes(urlVariant)) {
      localStorage.setItem('soshlops_variant', urlVariant);
      return urlVariant;
    }

    // Fall back to localStorage
    const storedVariant = localStorage.getItem('soshlops_variant');
    if (storedVariant && ['default', 'creator', 'business'].includes(storedVariant)) {
      return storedVariant;
    }

    // Default
    return 'default';
  });

  useEffect(() => {
    // Update localStorage when variant changes
    localStorage.setItem('soshlops_variant', variant);
  }, [variant]);

  return {
    role: variant, // Keep 'role' for backward compatibility
    copy: COPY_VARIANTS[variant],
    setRole: setVariant
  };
}
