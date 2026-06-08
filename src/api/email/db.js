/**
 * Email Campaigns data-access layer (RLS-scoped).
 * Every function takes the authenticated client from useSupabaseClient() and,
 * for inserts, the current orgId from useOrgId(). SELECTs are auto-scoped by RLS;
 * inserts must stamp organization_id explicitly.
 */

// ---------------- Contacts ----------------
export async function listContacts(supabase, { search, tag, consent, limit = 50, offset = 0 } = {}) {
  let q = supabase.from('email_contacts').select('*', { count: 'exact' })
    .order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  if (search) q = q.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  if (consent) q = q.eq('consent_status', consent);
  if (tag) q = q.contains('tags', [tag]);
  const { data, count, error } = await q;
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function createContact(supabase, orgId, input) {
  const { data, error } = await supabase.from('email_contacts').insert({
    organization_id: orgId,
    email: input.email,
    first_name: input.first_name ?? null,
    last_name: input.last_name ?? null,
    tags: input.tags ?? [],
    custom_fields: input.custom_fields ?? {},
    consent_status: input.consent_status ?? 'subscribed',
    consent_source: input.consent_source ?? 'manual',
    consent_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateContact(supabase, id, patch) {
  const { data, error } = await supabase.from('email_contacts').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteContact(supabase, id) {
  const { error } = await supabase.from('email_contacts').delete().eq('id', id);
  if (error) throw error;
}

/** Bulk upsert from CSV import (dedupe by org+email). Chunked. */
export async function importContacts(supabase, orgId, contacts) {
  const rows = contacts.map((c) => ({
    organization_id: orgId,
    email: c.email,
    first_name: c.first_name ?? null,
    last_name: c.last_name ?? null,
    tags: c.tags ?? [],
    consent_status: 'subscribed',
    consent_source: 'csv_import',
    consent_at: new Date().toISOString(),
  }));
  let imported = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error, count } = await supabase.from('email_contacts')
      .upsert(chunk, { onConflict: 'organization_id,email', count: 'exact' });
    if (error) throw error;
    imported += count ?? chunk.length;
  }
  return { imported };
}

export async function listTags(supabase) {
  const { data, error } = await supabase.from('email_contacts').select('tags').limit(1000);
  if (error) throw error;
  const set = new Set();
  for (const r of data ?? []) (r.tags ?? []).forEach((t) => set.add(t));
  return [...set].sort();
}

// ---------------- Campaigns ----------------
export async function listCampaigns(supabase, { status } = {}) {
  let q = supabase.from('email_campaigns').select('*').order('created_at', { ascending: false });
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getCampaign(supabase, id) {
  const { data, error } = await supabase.from('email_campaigns').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createCampaign(supabase, orgId, input) {
  const { data, error } = await supabase.from('email_campaigns').insert({
    organization_id: orgId,
    name: input.name ?? 'Untitled campaign',
    subject: input.subject ?? null,
    preview_text: input.preview_text ?? null,
    from_name: input.from_name ?? null,
    from_email: input.from_email ?? null,
    reply_to: input.reply_to ?? null,
    blocks: input.blocks ?? [],
    target_all: input.target_all ?? true,
    segment_id: input.segment_id ?? null,
    status: 'draft',
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateCampaign(supabase, id, patch) {
  const { data, error } = await supabase.from('email_campaigns').update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function scheduleCampaign(supabase, id, scheduledAt) {
  return updateCampaign(supabase, id, { status: 'scheduled', scheduled_at: scheduledAt });
}

export async function deleteCampaign(supabase, id) {
  const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
  if (error) throw error;
}

// ---------------- Sending domains ----------------
export async function listDomains(supabase) {
  const { data, error } = await supabase.from('email_sending_domains').select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ---------------- Settings (org email_settings jsonb) ----------------
export async function getEmailSettings(supabase, orgId) {
  const { data, error } = await supabase.from('organizations')
    .select('name, email_settings').eq('id', orgId).single();
  if (error) throw error;
  return { name: data.name, ...(data.email_settings ?? {}) };
}

export async function updateEmailSettings(supabase, orgId, settings) {
  const { error } = await supabase.from('organizations')
    .update({ email_settings: settings }).eq('id', orgId);
  if (error) throw error;
}

// ---------------- Analytics ----------------
async function recipientCount(supabase, filter) {
  let q = supabase.from('email_campaign_recipients').select('id', { count: 'exact', head: true });
  if (filter.campaignId) q = q.eq('campaign_id', filter.campaignId);
  if (filter.statusIn) q = q.in('status', filter.statusIn);
  const { count, error } = await q;
  if (error) throw error;
  return count ?? 0;
}

/** Dashboard KPIs. Rates computed from the recipient ledger (no race-y counters). */
export async function getDashboardKpis(supabase) {
  const [{ count: totalContacts }, { count: activeCampaigns }] = await Promise.all([
    supabase.from('email_contacts').select('id', { count: 'exact', head: true }).eq('consent_status', 'subscribed'),
    supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).in('status', ['scheduled', 'sending']),
  ]);
  const sent = await recipientCount(supabase, { statusIn: ['sent', 'delivered', 'opened', 'clicked'] });
  const opened = await recipientCount(supabase, { statusIn: ['opened', 'clicked'] });
  const clicked = await recipientCount(supabase, { statusIn: ['clicked'] });
  const unsubscribed = await recipientCount(supabase, { statusIn: ['unsubscribed'] });
  return {
    totalContacts: totalContacts ?? 0,
    activeCampaigns: activeCampaigns ?? 0,
    emailsSent: sent,
    openRate: sent ? Math.round((opened / sent) * 100) : 0,
    clickRate: sent ? Math.round((clicked / sent) * 100) : 0,
    unsubscribes: unsubscribed,
  };
}

/** Per-campaign stats from the recipient ledger. */
export async function getCampaignStats(supabase, campaignId) {
  const f = (statusIn) => recipientCount(supabase, { campaignId, statusIn });
  const [total, sent, delivered, opened, clicked, bounced, complained, unsubscribed] = await Promise.all([
    recipientCount(supabase, { campaignId }),
    f(['sent', 'delivered', 'opened', 'clicked']),
    f(['delivered', 'opened', 'clicked']),
    f(['opened', 'clicked']),
    f(['clicked']),
    f(['bounced']),
    f(['complained']),
    f(['unsubscribed']),
  ]);
  return { total, sent, delivered, opened, clicked, bounced, complained, unsubscribed };
}
