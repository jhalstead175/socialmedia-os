/**
 * Authenticated Supabase Client Hook
 *
 * Provides a Supabase client with Clerk JWT for RLS enforcement
 *
 * Usage:
 *   const supabase = useSupabaseClient();
 *   const { data } = await supabase.from('posts').select('*');
 */

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

/**
 * Hook that returns an authenticated Supabase client
 * Automatically injects Clerk JWT for RLS
 */
export function useSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const createAuthenticatedClient = async () => {
      let token = null;

      try {
        // Get Clerk token with Supabase claims
        // Note: This requires a Clerk JWT template named "supabase"
        // configured in Clerk Dashboard
        token = await getToken({ template: 'supabase' });
      } catch (error) {
        // JWT template doesn't exist - fall back to anon mode
        // This allows the app to work during development/testing
        // RLS will need to be disabled or policies updated
        console.warn('Clerk JWT template "supabase" not found. Running in anon mode. RLS may block requests.');
        console.warn('To fix: Create JWT template in Clerk Dashboard (see docs/CLERK_SUPABASE_SETUP.md)');
      }

      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      });

      setClient(supabaseClient);
    };

    createAuthenticatedClient();
  }, [getToken]);

  // Return a fallback unauthenticated client if not ready
  // This prevents null errors, but queries may fail with RLS
  return client || createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Server-side helper to get Clerk token for Edge Function calls
 *
 * Usage:
 *   const token = await getClerkToken();
 *   const { data, error } = await supabase.functions.invoke('my-function', {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 */
export async function getClerkTokenForSupabase(getToken: (options?: { template?: string }) => Promise<string | null>): Promise<string | null> {
  try {
    return await getToken({ template: 'supabase' });
  } catch (error) {
    console.error('Failed to get Clerk token:', error);
    return null;
  }
}
