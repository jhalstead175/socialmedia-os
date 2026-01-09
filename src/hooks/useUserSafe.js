/**
 * Safe wrapper for Clerk's useUser hook
 * Returns safe defaults when Clerk is not configured
 */

import { useUser as useClerkUser } from '@clerk/clerk-react';

export function useUser() {
  // Check if Clerk is configured
  const isClerkConfigured = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!isClerkConfigured) {
    // Return safe defaults when Clerk isn't configured
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }

  // Clerk is configured - use the real hook
  try {
    return useClerkUser();
  } catch (error) {
    // Fallback if hook fails
    console.error('useUser error:', error);
    return {
      isLoaded: true,
      isSignedIn: false,
      user: null,
    };
  }
}
