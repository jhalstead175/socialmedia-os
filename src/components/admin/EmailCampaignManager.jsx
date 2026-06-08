import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useOrgId } from '@/api/email/useOrgId';
import { useEmailFunctions } from '@/api/email/functions';
import { listCampaigns, createCampaign } from '@/api/email/db';
import { newBlock } from '@/lib/emailBlocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Admin broadcast tool (repurposed). Sends a quick branded broadcast to the
 * organization's subscribed contact list via the real email-send Edge Function,
 * and lists recent campaigns. Replaces the former Base44 stub-backed version.
 * The full builder lives at /EmailCampaignBuilder.
 */
export default function EmailCampaignManager() {
  const supabase = useSupabaseClient();
  const orgId = useOrgId();
  const { sendCampaign } = useEmailFunctions();

  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [draft, setDraft] = useState({ name: '', subject: '', body: '' });

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setCampaigns(await listCampaigns(supabase));
    } catch {
      setError('Failed to load campaigns.');
    }
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const set = (field, value) => setDraft((p) => ({ ...p, [field]: value }));

  const handleCreateAndSend = async (e) => {
    e.preventDefault();
    if (!draft.subject || !draft.body) { setError('Subject and body are required.'); return; }
    if (!orgId) { setError('Organization not ready. Try again in a moment.'); return; }
    setError(''); setSuccess(''); setIsSending(true);
    try {
      const blocks = [
        newBlock('text', { text: draft.body }),
      ];
      const campaign = await createCampaign(supabase, orgId, {
        name: draft.name || draft.subject,
        subject: draft.subject,
        blocks,
        target_all: true,
      });
      const result = await sendCampaign(campaign.id);
      setSuccess(`Broadcast queued. Sent ${result?.sent ?? 0}, remaining ${result?.remaining ?? 0}.`);
      setDraft({ name: '', subject: '', body: '' });
      load();
    } catch (err) {
      setError(`Failed to send: ${err.message}`);
    }
    setIsSending(false);
  };

  return (
    <div className="space-y-6">
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      {success && <Alert variant="default" className="bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription>{success}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle>Quick Broadcast to Contacts</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleCreateAndSend} className="space-y-4">
            <div>
              <Label htmlFor="name">Campaign name (internal)</Label>
              <Input id="name" value={draft.name} onChange={(e) => set('name', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={draft.subject} onChange={(e) => set('subject', e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea id="body" value={draft.body} onChange={(e) => set('body', e.target.value)} required className="h-40" />
            </div>
            <Button type="submit" disabled={isSending}>
              <Send className="w-4 h-4 mr-2" />
              {isSending ? 'Sending…' : 'Create & Send to all subscribed contacts'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Campaigns</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-40 w-full" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Recipients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell><Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge></TableCell>
                    <TableCell>{c.sent_at ? format(new Date(c.sent_at), 'PP p') : '—'}</TableCell>
                    <TableCell>{c.recipient_count || 0}</TableCell>
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
