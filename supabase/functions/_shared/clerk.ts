// JWKS-verified Clerk JWT auth for browser-callable Edge Functions.
// Stronger than the decode-only check in oauth-linkedin-start, because the
// email functions perform abuse-sensitive actions (sending mail, spending AI).
import { createRemoteJWKSet, jwtVerify } from "https://esm.sh/jose@5";
import { HttpError } from "./cors.ts";
import { supabaseAdmin } from "./supabaseAdmin.ts";

// CLERK_JWKS_URL e.g. https://<subdomain>.clerk.accounts.dev/.well-known/jwks.json
// or derived from CLERK_ISSUER + "/.well-known/jwks.json".
function jwksUrl(): URL {
  const explicit = Deno.env.get("CLERK_JWKS_URL");
  if (explicit) return new URL(explicit);
  const issuer = Deno.env.get("CLERK_ISSUER");
  if (issuer) return new URL(`${issuer.replace(/\/$/, "")}/.well-known/jwks.json`);
  throw new Error("Missing CLERK_JWKS_URL or CLERK_ISSUER");
}

let _jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function jwks() {
  if (!_jwks) _jwks = createRemoteJWKSet(jwksUrl());
  return _jwks;
}

export type AuthedOrg = {
  clerkUserId: string;
  orgId: string;
  userId: string | null;
};

/**
 * Verify the Authorization: Bearer <clerk-jwt> header and resolve the tenant.
 * Reads organization_id (or legacy org_id) from the verified claims; falls back
 * to a users lookup by clerk_user_id (= sub) if the claim is absent.
 */
export async function authOrg(req: Request): Promise<AuthedOrg> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "unauthorized", "Missing bearer token");

  let claims: Record<string, unknown>;
  try {
    const issuer = Deno.env.get("CLERK_ISSUER") || undefined;
    const { payload } = await jwtVerify(token, jwks(), issuer ? { issuer } : {});
    claims = payload as Record<string, unknown>;
  } catch (_e) {
    throw new HttpError(401, "unauthorized", "Invalid or expired token");
  }

  const sub = String(claims.sub ?? "");
  if (!sub) throw new HttpError(401, "unauthorized", "Token missing sub");

  let orgId = String(claims.organization_id ?? claims.org_id ?? "");
  let userId: string | null = null;

  if (!orgId) {
    const { data } = await supabaseAdmin()
      .from("users")
      .select("id, organization_id")
      .eq("clerk_user_id", sub)
      .single();
    if (!data) throw new HttpError(403, "no_org", "No organization for user");
    orgId = data.organization_id;
    userId = data.id;
  } else {
    const { data } = await supabaseAdmin()
      .from("users")
      .select("id")
      .eq("clerk_user_id", sub)
      .maybeSingle();
    userId = data?.id ?? null;
  }

  return { clerkUserId: sub, orgId, userId };
}

/** For cron/internal calls: shared-secret check instead of a user JWT. */
export function assertInternal(req: Request): void {
  const secret = Deno.env.get("INTERNAL_FUNCTION_SECRET");
  const provided = req.headers.get("x-internal-secret");
  if (!secret || provided !== secret) {
    throw new HttpError(401, "unauthorized", "Invalid internal secret");
  }
}
