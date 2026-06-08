import { useUser } from '@clerk/clerk-react';

/**
 * Current organization id for RLS-scoped inserts.
 * Bootstrap (useUserBootstrap) syncs it into Clerk unsafeMetadata, which is also
 * what the `supabase` JWT template reads, so it is reliable post-bootstrap.
 */
export function useOrgId() {
  const { user } = useUser();
  return user?.unsafeMetadata?.organization_id ?? null;
}
