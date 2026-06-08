// Shared CORS helpers for browser-callable Edge Functions.
// APP_ORIGIN should be set as a function secret in production; falls back to "*".
const ORIGIN = Deno.env.get("APP_ORIGIN") ?? "*";

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

export function preflight(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function ok(data: unknown, status = 200): Response {
  return json({ data }, status);
}

export class HttpError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function fail(err: unknown): Response {
  if (err instanceof HttpError) {
    return json({ error: { code: err.code, message: err.message } }, err.status);
  }
  console.error("Unhandled error:", err);
  const message = err instanceof Error ? err.message : "Internal error";
  return json({ error: { code: "internal_error", message } }, 500);
}
