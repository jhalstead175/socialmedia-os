import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useOrgId } from '@/api/email/useOrgId';
import { useEmailFunctions } from '@/api/email/functions';
import { listDomains, getEmailSettings, updateEmailSettings } from '@/api/email/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Plus, RefreshCw } from 'lucide-react';

export default function EmailSettings() {
  const supabase = useSupabaseClient();
  const orgId = useOrgId();
  const { createDomain, verifyDomain, refreshDomain } = useEmailFunctions();

  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState({ mailing_address: '', default_from_name: '', default_reply_to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [d, s] = await Promise.all([listDomains(supabase), orgId ? getEmailSettings(supabase, orgId) : null]);
      setDomains(d);
      if (s) setSettings({
        mailing_address: s.mailing_address || '', default_from_name: s.default_from_name || '',
        default_reply_to: s.default_reply_to || '',
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load();   }, [supabase, orgId]);

  const addDomain = async () => {
    if (!newDomain.trim()) return;
    setBusy(true); setStatus('');
    try { await createDomain(newDomain.trim()); setNewDomain(''); await load(); }
    catch (e) { setStatus(e.message); }
    setBusy(false);
  };
  const verify = async (d) => { setBusy(true); try { await verifyDomain(d.domain); await load(); } catch (e) { setStatus(e.message); } setBusy(false); };
  const refresh = async (d) => { setBusy(true); try { await refreshDomain(d.domain); await load(); } catch (e) { setStatus(e.message); } setBusy(false); };

  const saveSettings = async () => {
    if (!orgId) return;
    setBusy(true); setStatus('');
    try { await updateEmailSettings(supabase, orgId, settings); setStatus('Settings saved.'); }
    catch (e) { setStatus(e.message); }
    setBusy(false);
  };

  return (
    <div className="space-y-6 p-1 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
      {status && <div className="text-sm text-gray-700 bg-indigo-50 border border-indigo-100 rounded px-3 py-2">{status}</div>}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" />Sending Domains</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="mail.yourdomain.com" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} />
            <Button onClick={addDomain} disabled={busy}><Plus className="w-4 h-4 mr-2" />Add domain</Button>
          </div>
          <p className="text-xs text-gray-500">Free plan sends from a shared SoshlOps subdomain. Add your own domain (Pro+) for branded sending — then add the DNS records below and verify.</p>

          {loading ? <Skeleton className="h-24 w-full" /> : domains.length === 0 ? (
            <div className="text-sm text-gray-500">No custom domains yet.</div>
          ) : domains.map((d) => (
            <div key={d.id} className="rounded border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium">{d.domain}</div>
                <div className="flex items-center gap-2">
                  <Badge variant={d.status === 'verified' ? 'default' : 'secondary'}>{d.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => refresh(d)} disabled={busy}><RefreshCw className="w-4 h-4" /></Button>
                  {d.status !== 'verified' && <Button size="sm" variant="outline" onClick={() => verify(d)} disabled={busy}>Verify</Button>}
                </div>
              </div>
              {(d.dns_records || []).length > 0 && (
                <Table>
                  <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Name</TableHead><TableHead>Value</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {d.dns_records.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>{r.type}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{r.name}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{r.value}</TableCell>
                        <TableCell><Badge variant={r.status === 'verified' ? 'default' : 'secondary'}>{r.status || 'pending'}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Compliance & Defaults</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Physical mailing address (required in every email footer — CAN-SPAM)</Label>
            <Input value={settings.mailing_address} onChange={(e) => setSettings({ ...settings, mailing_address: e.target.value })}
              placeholder="123 Main St, Suite 100, City, ST 00000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Default from name</Label><Input value={settings.default_from_name} onChange={(e) => setSettings({ ...settings, default_from_name: e.target.value })} /></div>
            <div><Label>Default reply-to</Label><Input value={settings.default_reply_to} onChange={(e) => setSettings({ ...settings, default_reply_to: e.target.value })} /></div>
          </div>
          <Button onClick={saveSettings} disabled={busy}>Save settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
