/**
 * Authenticated Supabase Client Hook
 *
 * This hook provides a Supabase client with Clerk JWT authentication.
 * It automatically injects the user's JWT token for RLS to work.
 *
 * Usage:
 *   const supabase = useSupabaseClient();
 *   const { data, error } = await supabase.from('posts').select('*');
 *
 * IMPORTANT: This hook must be used inside React components.
 * For server-side or Edge Functions, use the server-side client.
 */

import { useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

export function useSupabaseClient(): SupabaseClient {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a mock client that throws on any operation
      return new Proxy({} as SupabaseClient, {
        get() {
          throw new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        }
      });
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: async () => {
          try {
            // Get JWT from Clerk
            const token = await getToken({ template: 'supabase' });
            
            if (!token) {
              console.warn('No Clerk token available. Supabase queries may fail due to RLS.');
              return {};
            }

            return {
              Authorization: `Bearer ${token}`
            };
          } catch (error) {
            console.error('Failed to get Clerk token:', error);
            return {};
          }
        }
      }
    });
  }, [getToken]);

  return supabase;
}
