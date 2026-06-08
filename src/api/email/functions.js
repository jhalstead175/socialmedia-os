import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabaseClient';

/**
 * Hook exposing the privileged email Edge Functions (send / test / domain).
 * Attaches the Clerk `supabase` JWT explicitly so the functions can verify it.
 * Returns the unwrapped `data` payload, or throws on error.
 */
export function useEmailFunctions() {
  const { getToken } = useAuth();

  async function invoke(name, body) {
    const token = await getToken({ template: 'supabase' });
    const { data, error } = await supabase.functions.invoke(name, {
      body,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error.message || 'Function error');
    return data?.data ?? data;
  }

  return {
    sendCampaign: (campaignId) => invoke('email-send', { campaign_id: campaignId }),
    sendTest: (payload) => invoke('email-test', payload),
    createDomain: (domain) => invoke('email-domain', { action: 'create', domain }),
    verifyDomain: (domain) => invoke('email-domain', { action: 'verify', domain }),
    refreshDomain: (domain) => invoke('email-domain', { action: 'status', domain }),
  };
}
