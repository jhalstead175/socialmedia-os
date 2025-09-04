
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, LifeBuoy, BarChart3, Mail, LineChart, Ticket } from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import SupportTicketViewer from '../components/admin/SupportTicketViewer';
import AnalyticsViewer from '../components/admin/AnalyticsViewer';
import PerformanceMonitorViewer from '../components/admin/PerformanceMonitorViewer';
import EmailCampaignManager from '../components/admin/EmailCampaignManager';
import AdminPromos from './AdminPromos'; // Added AdminPromos import

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-navy" />
            <h1 className="text-3xl font-bold text-navy">Admin Dashboard</h1>
          </div>
          <p className="text-slate-600">
            Manage users, support tickets, and view platform statistics.
          </p>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6"> {/* Changed grid-cols-5 to grid-cols-6 */}
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <LifeBuoy className="w-4 h-4" /> Support
            </TabsTrigger>
            <TabsTrigger value="promos" className="flex items-center gap-2"> {/* New Promo tab */}
              <Ticket className="w-4 h-4" /> Promos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <LineChart className="w-4 h-4" /> Performance
            </TabsTrigger>
            <TabsTrigger value="marketing" className="flex items-center gap-2">
              <Mail className="w-4 h-4" /> Marketing
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>
          <TabsContent value="tickets" className="mt-6">
            <SupportTicketViewer />
          </TabsContent>
          <TabsContent value="promos" className="mt-6"> {/* New Promo content */}
            <AdminPromos />
          </TabsContent>
          <TabsContent value="analytics" className="mt-6">
            <AnalyticsViewer />
          </TabsContent>
          <TabsContent value="performance" className="mt-6">
            <PerformanceMonitorViewer />
          </TabsContent>
          <TabsContent value="marketing" className="mt-6">
            <EmailCampaignManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
