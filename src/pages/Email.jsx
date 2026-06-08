import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { getDashboardKpis, listCampaigns } from '@/api/email/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Send, MousePointerClick, Eye, MailX, Megaphone, Plus } from 'lucide-react';
import { format } from 'date-fns';

const KPI = [
  { key: 'totalContacts', label: 'Total Contacts', icon: Users, suffix: '' },
  { key: 'activeCampaigns', label: 'Active Campaigns', icon: Megaphone, suffix: '' },
  { key: 'emailsSent', label: 'Emails Sent', icon: Send, suffix: '' },
  { key: 'openRate', label: 'Open Rate', icon: Eye, suffix: '%' },
  { key: 'clickRate', label: 'Click Rate', icon: MousePointerClick, suffix: '%' },
  { key: 'unsubscribes', label: 'Unsubscribes', icon: MailX, suffix: '' },
];

export default function Email() {
  const supabase = useSupabaseClient();
  const [kpis, setKpis] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [k, c] = await Promise.all([getDashboardKpis(supabase), listCampaigns(supabase)]);
        setKpis(k);
        setRecent(c.slice(0, 8));
      } catch (e) {
        console.error('Email dashboard load failed:', e);
      }
      setLoading(false);
    })();
  }, [supabase]);

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email</h1>
          <p className="text-sm text-gray-500">Campaigns, contacts, and performance.</p>
        </div>
        <Link to={createPageUrl('EmailCampaignBuilder')}>
          <Button><Plus className="w-4 h-4 mr-2" />New Campaign</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPI.map(({ key, label, icon: Icon, suffix }) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">{label}</span>
                <Icon className="w-4 h-4 text-gray-400" />
              </div>
              {loading || !kpis
                ? <Skeleton className="h-7 w-16 mt-2" />
                : <div className="text-2xl font-bold mt-1">{kpis[key]}{suffix}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Campaigns</CardTitle>
          <Link to={createPageUrl('EmailCampaigns')} className="text-sm text-indigo-600 hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : recent.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-3">No campaigns yet.</p>
              <Link to={createPageUrl('EmailContacts')}>
                <Button variant="outline">Import your contacts to get started</Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead><TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link to={`${createPageUrl('EmailCampaignBuilder')}?id=${c.id}`} className="hover:underline">{c.name}</Link>
                    </TableCell>
                    <TableCell><Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                    <TableCell>{c.recipient_count || 0}</TableCell>
                    <TableCell>{c.sent_at ? format(new Date(c.sent_at), 'PP') : '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
