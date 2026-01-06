import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// App ID can be overridden with VITE_BASE44_APP_ID environment variable
export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "68aceeea253a7630b16aa021",
  requiresAuth: true // Ensure authentication is required for all operations
});
