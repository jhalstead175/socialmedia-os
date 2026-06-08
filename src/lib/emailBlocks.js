/**
 * Canonical email block model — shared shape between the campaign builder UI,
 * the DB (`blocks` jsonb), and the server renderer
 * (supabase/functions/_shared/render.ts). Keep the two renderers in visual sync.
 *
 * Block: { id, type, text?, url?, alt?, level?, align? }
 *   type: 'heading' | 'text' | 'button' | 'image' | 'divider' | 'spacer'
 */

export const BLOCK_TYPES = ['heading', 'text', 'button', 'image', 'divider', 'spacer'];

let _seq = 0;
/** Create a new block with a client-side id (server ignores id on render). */
export function newBlock(type, props = {}) {
  _seq += 1;
  return { id: `b_${Date.now().toString(36)}_${_seq}`, type, ...props };
}

export function defaultCampaignBlocks() {
  return [
    newBlock('heading', { text: 'Your headline', level: 2, align: 'left' }),
    newBlock('text', { text: 'Write your message here. Use the AI panel to draft it for you.' }),
    newBlock('button', { text: 'Learn more', url: 'https://', align: 'left' }),
  ];
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

/** One block -> HTML fragment (table-based for email-client compatibility). */
export function blockToHtml(block) {
  const align = block.align || 'left';
  switch (block.type) {
    case 'heading': {
      const lvl = Math.min(Math.max(block.level || 2, 1), 3);
      const size = { 1: 28, 2: 22, 3: 18 }[lvl];
      return `<tr><td style="padding:8px 24px;text-align:${align};font-size:${size}px;font-weight:700;color:#111827;">${escapeHtml(block.text)}</td></tr>`;
    }
    case 'text':
      return `<tr><td style="padding:8px 24px;text-align:${align};font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(block.text).replace(/\n/g, '<br/>')}</td></tr>`;
    case 'button':
      return `<tr><td style="padding:16px 24px;text-align:${align};"><a href="${escapeHtml(block.url || '#')}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(block.text || 'Button')}</a></td></tr>`;
    case 'image':
      return block.url
        ? `<tr><td style="padding:8px 24px;text-align:${align};"><img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || '')}" style="max-width:100%;height:auto;border-radius:8px;" /></td></tr>`
        : '';
    case 'divider':
      return `<tr><td style="padding:8px 24px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>`;
    case 'spacer':
      return `<tr><td style="height:24px;line-height:24px;">&nbsp;</td></tr>`;
    default:
      return '';
  }
}

/**
 * Full HTML document for preview/send. `footerHtml` (unsubscribe + address) is
 * mandatory and injected by the caller; tokens like {{unsubscribe_url}} are
 * substituted server-side at send time.
 */
export function renderEmailHtml({ blocks = [], previewText = '', footerHtml = '' }) {
  const body = blocks.map(blockToHtml).join('\n');
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
      ${body}
      ${footerHtml}
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Plain-text fallback from blocks. */
export function renderEmailText({ blocks = [], footerText = '' }) {
  const lines = [];
  for (const b of blocks) {
    if (b.type === 'heading' || b.type === 'text') lines.push(b.text || '');
    else if (b.type === 'button') lines.push(`${b.text || 'Link'}: ${b.url || ''}`);
    else if (b.type === 'image' && b.alt) lines.push(`[${b.alt}]`);
    else if (b.type === 'divider') lines.push('----------');
  }
  if (footerText) lines.push('', footerText);
  return lines.join('\n\n');
}

/** Default footer HTML for preview (placeholders replaced server-side). */
export function previewFooterHtml(orgName = 'SoshlOps') {
  return `<tr><td style="padding:24px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af;">
    ${escapeHtml(orgName)} · {{org_address}}<br/>
    <a href="{{unsubscribe_url}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
  </td></tr>`;
}
