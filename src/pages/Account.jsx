import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard, Shield, FileText, Gift, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePaywall } from '../components/subscription/PaywallProvider';
import { toast } from 'sonner';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useUser } from '@/hooks/useUserSafe';
import { useAuth } from '@clerk/clerk-react';
import ConnectedAccountCard from '../components/ConnectedAccountCard';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY when invoking Supabase Edge Functions');
}

export default function Account() {
  const navigate = useNavigate();
  const { createPortalSession } = usePaywall();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const supabase = useSupabaseClient();

  const [connectedAccounts, setConnectedAccounts] = useState({
    linkedin: false,
    // X and Meta removed for LinkedIn-only MVP
  });
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { title: "Profile", description: "Personal and professional details", icon: User, page: "Profile" },
    { title: "Subscription", description: "Plan, invoices, and payment", icon: Settings, action: createPortalSession },
    { title: "Referrals", description: "Earn credits by referring", icon: Gift, page: "Referrals" },
    { title: "Security", description: "Password and authentication", icon: Shield },
    { title: "Billing", description: "Invoices and payment history", icon: FileText, action: createPortalSession },
    { title: "Team", description: "Invite and manage team", icon: Users },
  ];

  // Load connected accounts from Supabase
  useEffect(() => {
    async function loadConnectedAccounts() {
      if (!clerkUser) return;

      try {
        const { data: accounts, error } = await supabase
          .from('social_accounts')
          .select('platform, is_active')
          .eq('is_active', true);

        if (error) {
          console.error('Failed to load connected accounts:', error);
          return;
        }

        const accountsMap = {
          linkedin: false,
          // X and Meta removed for LinkedIn-only MVP
        };

        accounts?.forEach(account => {
          if (account.platform === 'linkedin') {
            accountsMap[account.platform] = true;
          }
        });

        setConnectedAccounts(accountsMap);
      } catch (err) {
        console.error('Error loading accounts:', err);
      } finally {
        setLoading(false);
      }
    }

    loadConnectedAccounts();
  }, [clerkUser]);

  // Handle OAuth callback success/error
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (connected) {
      const platformNames = {
        linkedin: 'LinkedIn',
        x: 'X (Twitter)',
        meta: 'Meta (Facebook)'
      };

      toast.success(`${platformNames[connected] || connected} account connected successfully`);
      // Update connected accounts state
      setConnectedAccounts(prev => ({ ...prev, [connected]: true }));
      // Clear URL params
      setSearchParams({});
    }

    if (error) {
      const errorMessages = {
        oauth_failed: 'OAuth authorization failed',
        invalid_request: 'Invalid OAuth request',
        state_mismatch: 'Security verification failed',
        token_exchange_failed: 'Failed to exchange authorization code',
        profile_fetch_failed: 'Failed to fetch profile',
        user_not_found: 'User account not found',
        storage_failed: 'Failed to store account credentials',
        no_pages_found: 'No Facebook Pages found. Please create a Page first.',
        pages_fetch_failed: 'Failed to fetch Facebook Pages',
        invalid_page: 'Invalid Facebook Page selected',
        oauth_init_failed: 'Failed to initiate OAuth flow',
        unexpected_error: 'An unexpected error occurred'
      };

      toast.error(errorMessages[error] || 'Connection failed');
      // Clear URL params
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleConnectAccount = async (platform) => {
    if (!clerkUser) {
      toast.error('Please sign in first');
      return;
    }

    // LinkedIn-only MVP - block other platforms
    if (platform !== 'linkedin') {
      toast.error('Only LinkedIn is supported in this version');
      return;
    }

    try {
      // Get Clerk JWT for authentication
      let clerkToken = null;
      try {
        clerkToken = await getToken({ template: 'supabase' });
      } catch (error) {
        console.warn('JWT template not found, OAuth will use standard token');
        // Fall back to standard Clerk session token
        clerkToken = await getToken();
      }

      if (!clerkToken) {
        toast.error('Authentication token not available');
        return;
      }

      // Use Supabase client to invoke Edge Function
      const functionName = 'oauth-linkedin-start';

      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
          apikey: supabaseAnonKey,
        },
        body: {}, // No need to send userId - extracted from JWT
      });

      if (error) {
        console.error('OAuth start error:', error);
        toast.error('Failed to start OAuth flow');
        return;
      }

      // Redirect to LinkedIn authorization page
      if (data?.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error('Failed to get authorization URL');
      }
    } catch (err) {
      console.error('Failed to start OAuth:', err);
      toast.error('Failed to connect account');
    }
  };

  const handleDisconnectAccount = async (platform) => {
    if (!clerkUser) return;

    try {
      // Set is_active = false for this platform
      const { error } = await supabase
        .from('social_accounts')
        .update({ is_active: false })
        .eq('platform', platform)
        .eq('is_active', true);

      if (error) throw error;

      // Update local state
      setConnectedAccounts(prev => ({ ...prev, [platform]: false }));

      const platformNames = {
        linkedin: 'LinkedIn',
        x: 'X',
        meta: 'Meta'
      };

      toast.success(`${platformNames[platform]} account disconnected`);
    } catch (err) {
      console.error('Failed to disconnect account:', err);
      toast.error('Failed to disconnect account');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'var(--bg)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="h1" style={{ color: 'var(--text-100)' }}>
            Account Settings
          </h1>
          <p className="lead mt-2">
            Manage connections and preferences
          </p>
        </div>

        {/* Connected Accounts Section */}
        <Card className="card mb-8">
          <CardHeader style={{ padding: 'var(--s-6)', borderBottom: '1px solid var(--bd-weak)' }}>
            <CardTitle className="h3" style={{ color: 'var(--text-100)' }}>
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: 'var(--s-6)' }}>
            <div className="space-y-3">
              {/* LinkedIn-only MVP */}
              <ConnectedAccountCard
                platform="linkedin"
                isConnected={connectedAccounts.linkedin}
                onConnect={() => handleConnectAccount('linkedin')}
                onReconnect={() => handleConnectAccount('linkedin')}
                onDisconnect={() => handleDisconnectAccount('linkedin')}
              />

              {/* Coming soon message for other platforms */}
              <div
                className="card-quiet"
                style={{
                  padding: 'var(--s-4)',
                  background: 'var(--surf-1)',
                  border: '1px dashed var(--bd-weak)',
                  borderRadius: 'var(--r-lg)'
                }}
              >
                <p className="text-xs" style={{ color: 'var(--text-60)' }}>
                  Additional platforms (X, Meta) coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Menu */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map(item => (
            <button
              key={item.title}
              className="card card-hover text-left"
              style={{ padding: 'var(--s-6)' }}
              onClick={() => item.page ? navigate(createPageUrl(item.page)) : item.action?.()}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--surf-2)' }}
                >
                  <item.icon className="w-5 h-5" style={{ color: 'var(--text-80)' }} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1" style={{ color: 'var(--text-100)' }}>
                    {item.title}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-60)' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
