import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useOrgId } from '@/api/email/useOrgId';
import { listCampaigns, createCampaign, deleteCampaign } from '@/api/email/db';
import { defaultCampaignBlocks } from '@/lib/emailBlocks';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'scheduled', label: 'Scheduled' },
  { key: 'sent', label: 'Sent' },
];

export default function EmailCampaigns() {
  const supabase = useSupabaseClient();
  const orgId = useOrgId();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      setRows(await listCampaigns(supabase, filter === 'all' ? {} : { status: filter }));
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load();   }, [supabase, filter]);

  const createAndOpen = async () => {
    if (!orgId) return;
    const c = await createCampaign(supabase, orgId, { name: 'Untitled campaign', blocks: defaultCampaignBlocks() });
    navigate(`${createPageUrl('EmailCampaignBuilder')}?id=${c.id}`);
  };

  const remove = async (c) => {
    if (!confirm(`Delete "${c.name}"?`)) return;
    await deleteCampaign(supabase, c.id); load();
  };

  const rate = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '—');

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
        <Button onClick={createAndOpen}><Plus className="w-4 h-4 mr-2" />New Campaign</Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>{FILTERS.map((f) => <TabsTrigger key={f.key} value={f.key}>{f.label}</TabsTrigger>)}</TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? <Skeleton className="h-64 w-full" /> : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No campaigns here yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead><TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead><TableHead>Open</TableHead>
                  <TableHead>Click</TableHead><TableHead>Date</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link to={`${createPageUrl('EmailCampaignBuilder')}?id=${c.id}`} className="hover:underline">{c.name}</Link>
                    </TableCell>
                    <TableCell><Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                    <TableCell>{c.recipient_count || 0}</TableCell>
                    <TableCell>{rate(c.opened_count, c.recipient_count)}</TableCell>
                    <TableCell>{rate(c.clicked_count, c.recipient_count)}</TableCell>
                    <TableCell>{c.sent_at ? format(new Date(c.sent_at), 'PP') : c.scheduled_at ? format(new Date(c.scheduled_at), 'PP') : '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(c)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
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
