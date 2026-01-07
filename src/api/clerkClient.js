/**
 * Clerk Authentication Client
 * Replaces Base44 SDK with Clerk for authentication
 */

import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

// Check if Clerk is configured
const isClerkConfigured = () => {
  return !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
};

/**
 * Hook-based Clerk Auth (for use in React components)
 * Safely handles case where Clerk is not configured
 */
export const useClerkAuth = () => {
  // If Clerk isn't configured, return safe defaults
  if (!isClerkConfigured()) {
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      async me() {
        throw new Error('Authentication not configured. Set VITE_CLERK_PUBLISHABLE_KEY in Vercel.');
      },
      async loginWithRedirect(redirectUrl) {
        console.error('Authentication not configured. Set VITE_CLERK_PUBLISHABLE_KEY in Vercel.');
        alert('Authentication is not yet configured. Please contact support.');
      },
      async logout() {
        console.warn('No user to log out.');
      },
      async updateMe(data) {
        throw new Error('Authentication not configured.');
      },
    };
  }

  // Clerk is configured - use hooks normally
  try {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const { signOut, redirectToSignIn } = useClerk();

    return {
      isAuthenticated: isSignedIn,
      isLoading: !isLoaded,
      user: user ? {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'User',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: user.publicMetadata?.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      } : null,

      async me() {
        if (!user) throw new Error('Not authenticated');
        return this.user;
      },

      async loginWithRedirect(redirectUrl) {
        return redirectToSignIn({ redirectUrl });
      },

      async logout() {
        return signOut();
      },

      async updateMe(data) {
        if (!user) throw new Error('Not authenticated');
        return user.update({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      },
    };
  } catch (error) {
    // Fallback if hooks fail
    console.error('Clerk hooks failed:', error);
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      async me() { throw new Error('Authentication error'); },
      async loginWithRedirect() { throw new Error('Authentication error'); },
      async logout() {},
      async updateMe() { throw new Error('Authentication error'); },
    };
  }
};

// Export singleton for backwards compatibility with Base44 API
export const clerkAuth = {
  me: async () => {
    // This won't work outside React context
    // Components should use useClerkAuth() instead
    throw new Error('Use useClerkAuth() hook in React components');
  },
  loginWithRedirect: async (redirectUrl) => {
    throw new Error('Use useClerkAuth() hook in React components');
  },
  logout: async () => {
    throw new Error('Use useClerkAuth() hook in React components');
  },
};
