import { useState, useEffect } from 'react';
import { ROLE_COPY } from '@/styles/rezemai.tokens';

/**
 * Hook to get role-based copy variants
 * Auto-detects from URL param: ?role=executive|legal|tech
 * Falls back to localStorage, then default to "executive"
 */
export function useRoleCopy() {
  const [role, setRole] = useState(() => {
    // Check URL param first
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');

    if (urlRole && ['executive', 'legal', 'tech'].includes(urlRole)) {
      localStorage.setItem('rezemai_role', urlRole);
      return urlRole;
    }

    // Fall back to localStorage
    const storedRole = localStorage.getItem('rezemai_role');
    if (storedRole && ['executive', 'legal', 'tech'].includes(storedRole)) {
      return storedRole;
    }

    // Default to executive
    return 'executive';
  });

  useEffect(() => {
    // Update localStorage when role changes
    localStorage.setItem('rezemai_role', role);
  }, [role]);

  return {
    role,
    copy: ROLE_COPY[role],
    setRole
  };
}
