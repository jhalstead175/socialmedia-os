import React, { useCallback, useEffect, useState } from 'react';
import { useSupabaseClient } from '@/hooks/useSupabaseClient';
import { useOrgId } from '@/api/email/useOrgId';
import {
  listContacts, createContact, deleteContact, updateContact, importContacts,
} from '@/api/email/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { UserPlus, Upload, Trash2, Search } from 'lucide-react';

const PAGE = 50;

/** Minimal CSV parser (handles quoted fields + commas). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') inQ = false;
      else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (field !== '' || row.length) { row.push(field); rows.push(row); row = []; field = ''; }
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export default function EmailContacts() {
  const supabase = useSupabaseClient();
  const orgId = useOrgId();
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [consent, setConsent] = useState('all');

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState({ email: '', first_name: '', last_name: '', tags: '' });
  const [importOpen, setImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listContacts(supabase, {
        search: search || undefined,
        consent: consent === 'all' ? undefined : consent,
        limit: PAGE, offset: page * PAGE,
      });
      setRows(res.rows); setCount(res.count);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [supabase, search, consent, page]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!adding.email || !orgId) return;
    setBusy(true); setMsg('');
    try {
      await createContact(supabase, orgId, {
        email: adding.email.trim(),
        first_name: adding.first_name || null,
        last_name: adding.last_name || null,
        tags: adding.tags ? adding.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
      setAddOpen(false); setAdding({ email: '', first_name: '', last_name: '', tags: '' });
      load();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const onFile = async (file) => {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) { setMsg('Empty CSV'); return; }
    const header = parsed[0].map((h) => h.trim().toLowerCase());
    const idx = {
      email: header.findIndex((h) => h.includes('email')),
      first: header.findIndex((h) => h.includes('first')),
      last: header.findIndex((h) => h.includes('last')),
    };
    const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const valid = [], invalid = [];
    for (const r of parsed.slice(1)) {
      const email = (r[idx.email] ?? '').trim();
      if (idx.email === -1 || !emailRe.test(email)) { invalid.push(email); continue; }
      valid.push({ email, first_name: idx.first >= 0 ? r[idx.first]?.trim() : '', last_name: idx.last >= 0 ? r[idx.last]?.trim() : '' });
    }
    setImportPreview({ valid, invalidCount: invalid.length, mappedEmail: idx.email >= 0 });
  };

  const runImport = async () => {
    if (!importPreview?.valid?.length || !orgId) return;
    setBusy(true); setMsg('');
    try {
      const { imported } = await importContacts(supabase, orgId, importPreview.valid);
      setMsg(`Imported ${imported} contacts (${importPreview.invalidCount} invalid skipped).`);
      setImportOpen(false); setImportPreview(null); setPage(0); load();
    } catch (e) { setMsg(e.message); }
    setBusy(false);
  };

  const unsubscribe = async (c) => {
    await updateContact(supabase, c.id, { consent_status: 'unsubscribed', unsubscribed_at: new Date().toISOString() });
    load();
  };
  const remove = async (c) => {
    if (!confirm(`Delete ${c.email}?`)) return;
    await deleteContact(supabase, c.id); load();
  };

  const pages = Math.max(1, Math.ceil(count / PAGE));

  return (
    <div className="space-y-4 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500">{count} total</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild><Button variant="outline"><Upload className="w-4 h-4 mr-2" />Import CSV</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Import contacts from CSV</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
                <p className="text-xs text-gray-500">We map columns whose headers contain email, first, and last. An email column is required; duplicates are merged by email.</p>
                {importPreview && (
                  <div className="rounded border p-3 text-sm bg-gray-50">
                    {importPreview.mappedEmail
                      ? <>Ready: <b>{importPreview.valid.length}</b> valid, <b>{importPreview.invalidCount}</b> invalid (skipped).</>
                      : <span className="text-red-600">No email column found.</span>}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={runImport} disabled={busy || !importPreview?.valid?.length}>
                  {busy ? 'Importing…' : 'Import'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild><Button><UserPlus className="w-4 h-4 mr-2" />Add Contact</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a contact</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email *</Label><Input value={adding.email} onChange={(e) => setAdding({ ...adding, email: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First name</Label><Input value={adding.first_name} onChange={(e) => setAdding({ ...adding, first_name: e.target.value })} /></div>
                  <div><Label>Last name</Label><Input value={adding.last_name} onChange={(e) => setAdding({ ...adding, last_name: e.target.value })} /></div>
                </div>
                <div><Label>Tags (comma-separated)</Label><Input value={adding.tags} onChange={(e) => setAdding({ ...adding, tags: e.target.value })} /></div>
              </div>
              <DialogFooter><Button onClick={handleAdd} disabled={busy || !adding.email}>Add</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {msg && <div className="text-sm text-gray-700 bg-indigo-50 border border-indigo-100 rounded px-3 py-2">{msg}</div>}

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
          <Input className="pl-8" placeholder="Search email or name…" value={search}
            onChange={(e) => { setPage(0); setSearch(e.target.value); }} />
        </div>
        <Select value={consent} onValueChange={(v) => { setPage(0); setConsent(v); }}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="subscribed">Subscribed</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            <SelectItem value="complained">Complained</SelectItem>
            <SelectItem value="cleaned">Cleaned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? <Skeleton className="h-64 w-full" /> : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No contacts found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead><TableHead>Name</TableHead>
                  <TableHead>Tags</TableHead><TableHead>Status</TableHead><TableHead /></TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.email}</TableCell>
                    <TableCell>{[c.first_name, c.last_name].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>{(c.tags || []).map((t) => <Badge key={t} variant="secondary" className="mr-1">{t}</Badge>)}</TableCell>
                    <TableCell>
                      <Badge variant={c.consent_status === 'subscribed' ? 'default' : 'secondary'}>{c.consent_status}</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {c.consent_status === 'subscribed' && (
                        <Button variant="ghost" size="sm" onClick={() => unsubscribe(c)}>Unsubscribe</Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => remove(c)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span>Page {page + 1} of {pages}</span>
          <Button variant="outline" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
