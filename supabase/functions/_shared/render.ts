// Server-side block renderer + personalization + signed unsubscribe tokens.
// Visual structure mirrors src/lib/emailBlocks.js (keep them in sync).

type Block = {
  type: string;
  text?: string;
  url?: string;
  alt?: string;
  level?: number;
  align?: string;
};

const ESC: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};
export function escapeHtml(s = ""): string {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

function blockToHtml(b: Block): string {
  const align = b.align || "left";
  switch (b.type) {
    case "heading": {
      const lvl = Math.min(Math.max(b.level || 2, 1), 3);
      const size = lvl === 1 ? 28 : lvl === 2 ? 22 : 18;
      return `<tr><td style="padding:8px 24px;text-align:${align};font-size:${size}px;font-weight:700;color:#111827;">${escapeHtml(b.text)}</td></tr>`;
    }
    case "text":
      return `<tr><td style="padding:8px 24px;text-align:${align};font-size:15px;line-height:1.6;color:#374151;">${escapeHtml(b.text).replace(/\n/g, "<br/>")}</td></tr>`;
    case "button":
      return `<tr><td style="padding:16px 24px;text-align:${align};"><a href="${escapeHtml(b.url || "#")}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">${escapeHtml(b.text || "Button")}</a></td></tr>`;
    case "image":
      return b.url
        ? `<tr><td style="padding:8px 24px;text-align:${align};"><img src="${escapeHtml(b.url)}" alt="${escapeHtml(b.alt || "")}" style="max-width:100%;height:auto;border-radius:8px;"/></td></tr>`
        : "";
    case "divider":
      return `<tr><td style="padding:8px 24px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"/></td></tr>`;
    case "spacer":
      return `<tr><td style="height:24px;line-height:24px;">&nbsp;</td></tr>`;
    default:
      return "";
  }
}

export function footerHtml(orgName: string, orgAddress: string): string {
  return `<tr><td style="padding:24px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af;">
    ${escapeHtml(orgName)} · ${escapeHtml(orgAddress)}<br/>
    <a href="{{unsubscribe_url}}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
  </td></tr>`;
}

export function renderCampaignHtml(opts: {
  blocks: Block[];
  previewText?: string;
  orgName: string;
  orgAddress: string;
}): string {
  const body = (opts.blocks || []).map(blockToHtml).join("\n");
  const preheader = opts.previewText
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(opts.previewText)}</div>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
      ${body}
      ${footerHtml(opts.orgName, opts.orgAddress)}
    </table>
  </td></tr>
</table>
</body></html>`;
}

/** Replace personalization + system tokens for one recipient. */
export function personalize(
  html: string,
  vars: Record<string, string>,
): string {
  return html.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, k) => vars[k] ?? "");
}

// ---- signed unsubscribe tokens (HMAC-SHA256) ----
function unsubSecret(): string {
  const s = Deno.env.get("UNSUBSCRIBE_SECRET") || Deno.env.get("INTERNAL_FUNCTION_SECRET");
  if (!s) throw new Error("Missing UNSUBSCRIBE_SECRET");
  return s;
}

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function signUnsubToken(payload: {
  org: string; contact: string; campaign?: string;
}): Promise<string> {
  const data = `${payload.org}.${payload.contact}.${payload.campaign ?? ""}`;
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(unsubSecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  return `${b64url(new TextEncoder().encode(data))}.${b64url(sig)}`;
}

export async function verifyUnsubToken(token: string): Promise<
  { org: string; contact: string; campaign: string } | null
> {
  const [dataB64, sigB64] = token.split(".");
  if (!dataB64 || !sigB64) return null;
  const data = atob(dataB64.replace(/-/g, "+").replace(/_/g, "/"));
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(unsubSecret()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const expected = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data)));
  if (b64url(expected) !== sigB64) return null;
  const [org, contact, campaign] = data.split(".");
  return { org, contact, campaign };
}
