import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useOrgId } from '@/api/email/useOrgId';
import { useEmailFunctions } from '@/api/email/functions';
import {
  getCampaign, createCampaign, updateCampaign, scheduleCampaign,
} from '@/api/email/db';
import {
  newBlock, defaultCampaignBlocks, renderEmailHtml, previewFooterHtml,
} from '@/lib/emailBlocks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Type, Heading, MousePointer2, Image as ImageIcon, Minus,
  ArrowUp, ArrowDown, Trash2, Send, Save, FlaskConical,
} from 'lucide-react';

const ADDABLE = [
  { type: 'heading', label: 'Heading', icon: Heading, props: { text: 'Heading', level: 2 } },
  { type: 'text', label: 'Text', icon: Type, props: { text: 'New paragraph.' } },
  { type: 'button', label: 'Button', icon: MousePointer2, props: { text: 'Click here', url: 'https://' } },
  { type: 'image', label: 'Image', icon: ImageIcon, props: { url: '', alt: '' } },
  { type: 'divider', label: 'Divider', icon: Minus, props: {} },
];

export default function EmailCampaignBuilder() {
  const supabase = useSupabaseClient();
  const orgId = useOrgId();
  const { sendCampaign, sendTest } = useEmailFunctions();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get('id');

  const [c, setC] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [testTo, setTestTo] = useState('');
  const [testOpen, setTestOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState('');

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          const data = await getCampaign(supabase, id);
          setC(data); setBlocks(data.blocks?.length ? data.blocks : defaultCampaignBlocks());
        } catch (e) { setStatus(`Load failed: ${e.message}`); }
      } else if (orgId) {
        const data = await createCampaign(supabase, orgId, { name: 'Untitled campaign', blocks: defaultCampaignBlocks() });
        navigate(`${createPageUrl('EmailCampaignBuilder')}?id=${data.id}`, { replace: true });
      }
    })();
    // eslint-disable-next-line
  }, [id, orgId]);

  const set = (field, value) => setC((p) => ({ ...p, [field]: value }));
  const setBlock = (i, patch) => setBlocks((b) => b.map((blk, idx) => (idx === i ? { ...blk, ...patch } : blk)));
  const addBlock = (t) => setBlocks((b) => [...b, newBlock(t.type, t.props)]);
  const move = (i, d) => setBlocks((b) => {
    const j = i + d; if (j < 0 || j >= b.length) return b;
    const copy = [...b]; [copy[i], copy[j]] = [copy[j], copy[i]]; return copy;
  });
  const removeBlock = (i) => setBlocks((b) => b.filter((_, idx) => idx !== i));

  const previewHtml = useMemo(() => renderEmailHtml({
    blocks, previewText: c?.preview_text || '', footerHtml: previewFooterHtml(c?.from_name || 'SoshlOps'),
  }), [blocks, c?.preview_text, c?.from_name]);

  const save = async () => {
    if (!c) return;
    setSaving(true); setStatus('');
    try {
      await updateCampaign(supabase, c.id, {
        name: c.name, subject: c.subject, preview_text: c.preview_text,
        from_name: c.from_name, from_email: c.from_email, reply_to: c.reply_to, blocks,
      });
      setStatus('Saved.');
    } catch (e) { setStatus(`Save failed: ${e.message}`); }
    setSaving(false);
  };

  const doTest = async () => {
    setStatus('');
    try {
      const to = testTo.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
      await sendTest({ campaign_id: c.id, to });
      setTestOpen(false); setStatus(`Test sent to ${to.length} address(es).`);
    } catch (e) { setStatus(`Test failed: ${e.message}`); }
  };

  const sendNow = async () => {
    if (!confirm('Send this campaign to all subscribed contacts now?')) return;
    await save();
    setStatus('Sending…');
    try {
      const r = await sendCampaign(c.id);
      setStatus(`Queued. Sent ${r?.sent ?? 0}, remaining ${r?.remaining ?? 0}.`);
      const fresh = await getCampaign(supabase, c.id); setC(fresh);
    } catch (e) { setStatus(`Send failed: ${e.message}`); }
  };

  const doSchedule = async () => {
    if (!scheduleAt) return;
    await save();
    try {
      await scheduleCampaign(supabase, c.id, new Date(scheduleAt).toISOString());
      const fresh = await getCampaign(supabase, c.id); setC(fresh);
      setStatus(`Scheduled for ${new Date(scheduleAt).toLocaleString()}.`);
    } catch (e) { setStatus(`Schedule failed: ${e.message}`); }
  };

  if (!c) return <div className="p-6 text-gray-500">Loading…</div>;
  const sent = ['sent', 'sending'].includes(c.status);

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Input value={c.name || ''} onChange={(e) => set('name', e.target.value)}
            className="text-lg font-semibold w-64" />
          <Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Dialog open={testOpen} onOpenChange={setTestOpen}>
            <DialogTrigger asChild><Button variant="outline"><FlaskConical className="w-4 h-4 mr-2" />Send Test</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send a test</DialogTitle></DialogHeader>
              <Label>Recipients (comma-separated, max 5)</Label>
              <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" />
              <DialogFooter><Button onClick={doTest} disabled={!testTo}>Send test</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={save} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? 'Saving…' : 'Save'}</Button>
          <Button onClick={sendNow} disabled={sent}><Send className="w-4 h-4 mr-2" />Send now</Button>
        </div>
      </div>
      {status && <div className="text-sm text-gray-700 bg-indigo-50 border border-indigo-100 rounded px-3 py-2">{status}</div>}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Editor */}
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="content">
              <TabsList className="mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-3">
                {blocks.map((b, i) => (
                  <div key={b.id || i} className="rounded border p-3 space-y-2 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-gray-400">{b.type}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => removeBlock(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </div>
                    {(b.type === 'heading' || b.type === 'text' || b.type === 'button') && (
                      <Textarea value={b.text || ''} onChange={(e) => setBlock(i, { text: e.target.value })}
                        className={b.type === 'text' ? 'h-20' : 'h-10'} />
                    )}
                    {(b.type === 'button' || b.type === 'image') && (
                      <Input value={b.url || ''} placeholder={b.type === 'image' ? 'Image URL' : 'Link URL'}
                        onChange={(e) => setBlock(i, { url: e.target.value })} />
                    )}
                    {b.type === 'image' && (
                      <Input value={b.alt || ''} placeholder="Alt text" onChange={(e) => setBlock(i, { alt: e.target.value })} />
                    )}
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-2">
                  {ADDABLE.map((t) => (
                    <Button key={t.type} variant="outline" size="sm" onClick={() => addBlock(t)}>
                      <t.icon className="w-4 h-4 mr-1" />{t.label}
                    </Button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-3">
                <div><Label>Subject</Label><Input value={c.subject || ''} onChange={(e) => set('subject', e.target.value)} /></div>
                <div><Label>Preview text</Label><Input value={c.preview_text || ''} onChange={(e) => set('preview_text', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>From name</Label><Input value={c.from_name || ''} onChange={(e) => set('from_name', e.target.value)} /></div>
                  <div><Label>From email</Label><Input value={c.from_email || ''} onChange={(e) => set('from_email', e.target.value)} placeholder="news@yourdomain.com" /></div>
                </div>
                <div><Label>Reply-to</Label><Input value={c.reply_to || ''} onChange={(e) => set('reply_to', e.target.value)} /></div>
                <p className="text-xs text-gray-500">Audience: all subscribed contacts. Footer + unsubscribe are added automatically (required by law).</p>
                <div className="pt-2 border-t">
                  <Label>Schedule for later</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
                    <Button variant="outline" onClick={doSchedule} disabled={sent || !scheduleAt}>Schedule</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader><CardTitle className="text-sm text-gray-500">Preview</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded border bg-gray-100 p-2 mb-2 text-sm">
              <div className="font-semibold truncate">{c.subject || '(no subject)'}</div>
              <div className="text-gray-500 truncate">{c.preview_text || ''}</div>
            </div>
            <iframe title="preview" srcDoc={previewHtml} className="w-full h-[520px] rounded border bg-white" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
