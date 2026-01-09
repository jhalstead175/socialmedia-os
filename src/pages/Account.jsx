import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard, Shield, FileText, Gift, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePaywall } from '../components/subscription/PaywallProvider';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/clerk-react';
import ConnectedAccountCard from '../components/ConnectedAccountCard';

export default function Account() {
  const navigate = useNavigate();
  const { createPortalSession } = usePaywall();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: clerkUser } = useUser();

  const [connectedAccounts, setConnectedAccounts] = useState({
    x: false,
    linkedin: false,
    meta: false
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
          x: false,
          linkedin: false,
          meta: false
        };

        accounts?.forEach(account => {
          accountsMap[account.platform] = true;
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

  const handleConnectAccount = (platform) => {
    const oauthEndpoints = {
      linkedin: '/api/oauth/linkedin/start',
      x: '/api/oauth/x/start',
      meta: '/api/oauth/meta/start'
    };

    const endpoint = oauthEndpoints[platform];

    if (endpoint) {
      // Redirect to OAuth start endpoint
      window.location.href = endpoint;
    } else {
      toast.error(`Platform ${platform} not supported`);
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
              <ConnectedAccountCard
                platform="x"
                isConnected={connectedAccounts.x}
                onConnect={() => handleConnectAccount('x')}
                onReconnect={() => handleConnectAccount('x')}
              />
              <ConnectedAccountCard
                platform="linkedin"
                isConnected={connectedAccounts.linkedin}
                onConnect={() => handleConnectAccount('linkedin')}
                onReconnect={() => handleConnectAccount('linkedin')}
              />
              <ConnectedAccountCard
                platform="meta"
                isConnected={connectedAccounts.meta}
                onConnect={() => handleConnectAccount('meta')}
                onReconnect={() => handleConnectAccount('meta')}
              />
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
