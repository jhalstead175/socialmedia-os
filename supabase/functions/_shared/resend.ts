// Minimal Resend REST wrapper. RESEND_API_KEY is a function secret (never client).
import { HttpError } from "./cors.ts";

const BASE = "https://api.resend.com";

function key(): string {
  const k = Deno.env.get("RESEND_API_KEY");
  if (!k) throw new Error("Missing RESEND_API_KEY");
  return k;
}

async function call(path: string, init: RequestInit): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  if (!res.ok) {
    throw new HttpError(
      res.status === 422 ? 422 : 502,
      "resend_error",
      body?.message ?? `Resend ${path} failed (${res.status})`,
    );
  }
  return body;
}

export type SendEmailInput = {
  from: string;            // "Name <addr@domain>"
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  reply_to?: string;
  headers?: Record<string, string>;
  tags?: Array<{ name: string; value: string }>;
};

export function sendEmail(input: SendEmailInput) {
  return call("/emails", { method: "POST", body: JSON.stringify(input) });
}

/** Resend batch send (up to 100 messages). */
export function sendBatch(messages: SendEmailInput[]) {
  return call("/emails/batch", { method: "POST", body: JSON.stringify(messages) });
}

export function createDomain(name: string, region = "us-east-1") {
  return call("/domains", { method: "POST", body: JSON.stringify({ name, region }) });
}

export function verifyDomain(id: string) {
  return call(`/domains/${id}/verify`, { method: "POST", body: "{}" });
}

export function getDomain(id: string) {
  return call(`/domains/${id}`, { method: "GET" });
}
