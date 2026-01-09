/**
 * User Bootstrap Hook
 *
 * Ensures user and organization records exist in Supabase on first login.
 * Runs once per session when Clerk user is authenticated.
 *
 * Flow:
 * 1. Check if user exists in Supabase
 * 2. If not, create organization
 * 3. Then create user record
 * 4. Return org_id for RLS context
 */

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabaseClient';

export function useUserBootstrap() {
  const { user: clerkUser, isLoaded } = useUser();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function bootstrapUser() {
      if (!isLoaded || !clerkUser) {
        setLoading(false);
        return;
      }

      try {
        // 1. Check if user already exists
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('id, organization_id')
          .eq('clerk_user_id', clerkUser.id)
          .maybeSingle();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // PGRST116 = not found, which is expected for new users
          throw fetchError;
        }

        if (existingUser) {
          // User already bootstrapped
          setOrganizationId(existingUser.organization_id);
          setBootstrapped(true);
          setLoading(false);
          return;
        }

        // 2. User doesn't exist - create organization first
        const orgName = clerkUser.primaryEmailAddress?.emailAddress
          ? `${clerkUser.primaryEmailAddress.emailAddress}'s Organization`
          : `${clerkUser.firstName || 'User'}'s Organization`;

        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: orgName
          })
          .select('id')
          .single();

        if (orgError) {
          throw new Error(`Failed to create organization: ${orgError.message}`);
        }

        // 3. Create user record
        const { error: userError } = await supabase
          .from('users')
          .insert({
            organization_id: newOrg.id,
            clerk_user_id: clerkUser.id,
            full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            email: clerkUser.primaryEmailAddress?.emailAddress || null
          });

        if (userError) {
          throw new Error(`Failed to create user: ${userError.message}`);
        }

        // 4. Success
        setOrganizationId(newOrg.id);
        setBootstrapped(true);
        console.log(`✅ User bootstrapped: org_id = ${newOrg.id}`);

      } catch (err) {
        console.error('Bootstrap error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    bootstrapUser();
  }, [clerkUser, isLoaded]);

  return {
    bootstrapped,
    loading,
    organizationId,
    error
  };
}
