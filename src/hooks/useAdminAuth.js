import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';

/**
 * SECURITY HOOK: Verifies admin role before allowing access
 *
 * Defense in depth: This provides client-side protection.
 * Base44 SDK enforces server-side authorization on all API calls.
 *
 * @returns {Object} { isAuthorized: boolean, isChecking: boolean }
 */
export function useAdminAuth() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const currentUser = await User.me();

        if (currentUser?.role === 'admin') {
          setIsAuthorized(true);
        } else {
          // Non-admin user - redirect to dashboard
          console.warn('Unauthorized admin access attempt by:', currentUser?.email);
          navigate(createPageUrl('Dashboard'), { replace: true });
        }
      } catch (error) {
        // Not authenticated - redirect to landing
        console.error('Admin auth check failed:', error);
        navigate(createPageUrl('Landing'), { replace: true });
      }
      setIsChecking(false);
    };

    checkAdminAccess();
  }, [navigate]);

  return { isAuthorized, isChecking };
}
