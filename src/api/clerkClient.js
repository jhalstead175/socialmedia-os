/**
 * Clerk Authentication Client
 * Replaces Base44 SDK with Clerk for authentication
 */

import { useAuth, useUser, useClerk } from '@clerk/clerk-react';

/**
 * Clerk Auth Adapter
 * Provides Base44-compatible API for authentication
 */
export const createClerkAuth = () => {
  return {
    // Check if user is authenticated
    isAuthenticated: async () => {
      const { isSignedIn } = useAuth();
      return isSignedIn;
    },

    // Get current user
    me: async () => {
      const { user } = useUser();
      if (!user) throw new Error('Not authenticated');

      // Map Clerk user to Base44-like format
      return {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName || user.firstName || 'User',
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        // Role will need to come from user metadata
        role: user.publicMetadata?.role || 'user',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },

    // Login with redirect (Google OAuth)
    loginWithRedirect: async (redirectUrl) => {
      const { redirectToSignIn } = useClerk();
      return redirectToSignIn({ redirectUrl });
    },

    // Logout
    logout: async () => {
      const { signOut } = useClerk();
      return signOut();
    },

    // Update user profile
    updateMe: async (data) => {
      const { user } = useUser();
      if (!user) throw new Error('Not authenticated');

      return user.update({
        firstName: data.firstName,
        lastName: data.lastName,
        // Add other fields as needed
      });
    },
  };
};

/**
 * Hook-based Clerk Auth (for use in React components)
 */
export const useClerkAuth = () => {
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
