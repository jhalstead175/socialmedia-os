/**
 * EmailService — DEPRECATED.
 *
 * This file previously contained REZEMAI (a résumé product) transactional email
 * templates and app.rezemai.com URLs — unrelated to SoshlOps. All of that
 * contaminated content has been removed.
 *
 * Outbound email for SoshlOps now lives server-side:
 *   - Marketing campaigns:  supabase/functions/email-send + src/api/email/
 *   - (Future) lifecycle/transactional SoshlOps emails will be rebuilt as
 *     server-side templates; see docs/email-campaigns/.
 *
 * Nothing imports this module; it is retained only as a tombstone to make the
 * removal explicit and is safe to delete.
 */

const EmailService = {
  deprecated: true,
  note: 'Use src/api/email + Supabase Edge Functions instead.',
};

export default EmailService;
