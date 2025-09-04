import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Settings, CreditCard, Shield, FileText, Gift, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePaywall } from '../components/subscription/PaywallProvider';

export default function Account() {
  const navigate = useNavigate();
  const { createPortalSession } = usePaywall();

  const menuItems = [
    { title: "Profile", description: "Edit your personal and professional details.", icon: User, page: "Profile" },
    { title: "Subscription", description: "Manage your plan, view invoices, and update payment.", icon: Settings, action: createPortalSession },
    { title: "Referrals", description: "Earn credits by referring friends.", icon: Gift, page: "Referrals" },
    { title: "Security", description: "Change password and manage 2FA.", icon: Shield },
    { title: "Billing History", description: "Access all your past invoices.", icon: FileText, action: createPortalSession },
    { title: "Team Members", description: "Invite and manage your team (Elite Plan).", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-warm-white p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy">Account Settings</h1>
          <p className="text-slate-600">Central hub for managing your REZEMAI account.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map(item => (
            <Card 
              key={item.title} 
              className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => item.page ? navigate(createPageUrl(item.page)) : item.action?.()}
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <item.icon className="w-6 h-6 text-navy" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}