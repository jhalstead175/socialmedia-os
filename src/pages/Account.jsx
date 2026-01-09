import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard, Shield, FileText, Gift, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePaywall } from '../components/subscription/PaywallProvider';
import ConnectedAccountCard from '../components/ConnectedAccountCard';
import ConnectAccountModal from '../components/ConnectAccountModal';

export default function Account() {
  const navigate = useNavigate();
  const { createPortalSession } = usePaywall();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  // UI ONLY - Mock connection state
  const [connectedAccounts] = useState({
    x: false,
    linkedin: false,
    meta: false
  });

  const menuItems = [
    { title: "Profile", description: "Personal and professional details", icon: User, page: "Profile" },
    { title: "Subscription", description: "Plan, invoices, and payment", icon: Settings, action: createPortalSession },
    { title: "Referrals", description: "Earn credits by referring", icon: Gift, page: "Referrals" },
    { title: "Security", description: "Password and authentication", icon: Shield },
    { title: "Billing", description: "Invoices and payment history", icon: FileText, action: createPortalSession },
    { title: "Team", description: "Invite and manage team", icon: Users },
  ];

  const handleConnectAccount = (platform) => {
    setSelectedPlatform(platform);
    setShowConnectModal(true);
  };

  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
    setSelectedPlatform(null);
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

      <ConnectAccountModal
        isOpen={showConnectModal}
        onClose={handleCloseConnectModal}
        platform={selectedPlatform}
      />
    </div>
  );
}
