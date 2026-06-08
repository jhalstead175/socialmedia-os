# Email Campaigns — Edge Functions

Server-side functions for the Email Campaigns module. All secrets are
**function secrets**, never `VITE_*`.

## Functions

| Function | Auth | verify_jwt | Trigger |
|----------|------|-----------|---------|
| `email-domain` | Clerk JWT (JWKS) | **false** | browser |
| `email-send` | Clerk JWT or internal secret | **false** | browser + cron |
| `email-test` | Clerk JWT (JWKS) | **false** | browser |
| `resend-webhook` | Svix signature | **false** | Resend |
| `email-unsubscribe` | signed token | **false** | public link |
| `campaign-scheduler` | none (cron) | **false** | Supabase cron |

> Deploy all with `verify_jwt = false`: each implements its **own** auth in code
> (JWKS-verified Clerk JWT, Svix signature, signed HMAC token, or internal secret),
> which is stronger/more specific than the platform gate. Shared helpers live in
> `_shared/` (`cors.ts`, `supabaseAdmin.ts`, `clerk.ts`, `resend.ts`, `render.ts`).

## Required secrets

```
SUPABASE_URL                # provided by platform
SUPABASE_SERVICE_ROLE_KEY   # provided by platform
SUPABASE_ANON_KEY           # for cron -> function calls
RESEND_API_KEY
RESEND_WEBHOOK_SECRET       # Svix signing secret from the Resend webhook
ANTHROPIC_API_KEY           # Phase 2 (ai-generate)
CLERK_JWKS_URL              # e.g. https://<app>.clerk.accounts.dev/.well-known/jwks.json
CLERK_ISSUER                # optional, enables issuer check
APP_ORIGIN                  # e.g. https://app.soshlops.com (CORS)
SHARED_SENDING_DOMAIN       # free-tier shared subdomain, e.g. mail.soshlops.com
UNSUBSCRIBE_SECRET          # HMAC secret for unsubscribe tokens
INTERNAL_FUNCTION_SECRET    # cron -> email-send shared secret
```

Set them: `supabase secrets set KEY=value --project-ref <ref>`

## Deploy (CLI)

```bash
supabase functions deploy email-domain        --no-verify-jwt --project-ref <ref>
supabase functions deploy email-send          --no-verify-jwt --project-ref <ref>
supabase functions deploy email-test          --no-verify-jwt --project-ref <ref>
supabase functions deploy resend-webhook      --no-verify-jwt --project-ref <ref>
supabase functions deploy email-unsubscribe   --no-verify-jwt --project-ref <ref>
supabase functions deploy campaign-scheduler  --no-verify-jwt --project-ref <ref>
```

## Cron

Schedule `campaign-scheduler` every minute (Supabase Dashboard → Database → Cron,
or `cron.schedule`) to dispatch due scheduled campaigns. Mirrors the existing
`scheduler` function.

## Resend webhook

Create a Resend webhook → `https://<ref>.functions.supabase.co/resend-webhook`,
subscribe to delivered/opened/clicked/bounced/complained, and put its signing
secret in `RESEND_WEBHOOK_SECRET`.
