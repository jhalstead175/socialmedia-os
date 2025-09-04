// CheckoutCTA.js
// Requires your earlier helpers: BillingURL, PromoURL, and a central PRICE table.
// If PRICE lives elsewhere, import it; otherwise keep this local copy.

import { BillingURL } from "../subscription/BillingURL";
import { PromoURL } from "../marketing/PromoURL";

// Central price table (USD). Keep in one place.
export const PRICE = {
  pro:   { monthly: 19,  annual: 144 },
  elite: { monthly: 49,  annual: 468 }
};

// --- Format helpers ---
const fmt = (n) => `$${Number(n).toFixed(2).replace(/\.00$/,'')}`;
const effMo = (yr) => `≈ ${fmt(yr/12)}/mo`;

// Promo math + label generator (re-usable core)
export function priceView({ plan, billing, promo }) {
  const base = PRICE?.[plan]?.[billing];
  if (typeof base !== "number") {
    return {
      original: "",
      discounted: null,
      footnote: null,
      ctaLabel: `Upgrade to ${plan[0].toUpperCase()+plan.slice(1)}`
    };
  }

  const eligible =
    promo?.valid &&
    Array.isArray(promo?.applies_to_plans) && promo.applies_to_plans.includes(plan) &&
    Array.isArray(promo?.applies_to_billing) && promo.applies_to_billing.includes(billing);

  if (!eligible) {
    return {
      original: billing==='monthly' ? `${fmt(base)}/mo` : `${fmt(base)}/yr`,
      discounted: null,
      footnote: null,
      ctaLabel: `Upgrade to ${plan[0].toUpperCase()+plan.slice(1)}`
    };
  }

  const type = promo.type; // "percent" | "fixed_amount"
  const val  = promo.value_number; // percent (e.g., 30) or cents (e.g., 2000)
  const dur  = promo.duration; // "once" | "repeating" | "forever"
  const N    = promo.duration_in_months || (billing==='annual' && dur!=='once' ? 12 : 1);
  const code = promo.code || PromoURL.get?.() || "";

  let disc;
  if (type === "percent") {
    const factor = Math.max(0, 1 - (val || 0)/100);
    disc = +(base * factor).toFixed(2);
  } else {
    const off = billing==='monthly'
      ? (val||0)/100
      : (dur==='once' ? (val||0)/100 : ((val||0)/100) * N);
    disc = Math.max(0, +(base - off).toFixed(2));
  }

  // Footnote string
  let windowTxt;
  if (dur === "once")           windowTxt = billing==='monthly' ? `First month` : `First year`;
  else if (dur === "forever")   windowTxt = `Every renewal`;
  else                          windowTxt = billing==='monthly' ? `First ${N} mo` : `First year`;

  const original   = billing==='monthly' ? `${fmt(base)}/mo` : `${fmt(base)}/yr`;
  const discounted = billing==='monthly' ? `${fmt(disc)}/mo` : `${fmt(disc)}/yr`;
  const footnote   = type==="percent"
    ? `Save ${val}% • ${windowTxt}`
    : `Save ${fmt((val||0)/100)}${dur==='repeating'
        ? (billing==='monthly' ? `/mo • ${windowTxt}` : ` • ${windowTxt}`)
        : ` • ${windowTxt}`}`;

  const ctaLabel = code
    ? `Apply ${code} & Upgrade — ${discounted}`
    : `Upgrade to ${plan[0].toUpperCase()+plan.slice(1)}`;

  return { original, discounted, footnote, ctaLabel };
}

// --- Public API ---

/**
 * Build a checkout CTA for a plan.
 * @param {Object} opts
 * @param {"pro"|"elite"} opts.plan
 * @param {"monthly"|"annual"} [opts.billing]  // defaults from URL/local (BillingURL)
 * @param {Object} [opts.promo]  // defaults from PromoStore/global URL
 * @param {boolean} [opts.forceBilling]        // if true, forces given billing into href
 * @returns {Object} { href, label, footnote, plan, billing, hasPromo, analytics }
 */
export function buildCheckoutCta(opts) {
  const plan = opts?.plan || "pro";
  const billing = opts?.billing || BillingURL.get?.() || "annual";

  // Source promo: prefer an explicit object, else window.PromoStore, else URL param
  const promoObj = opts?.promo || window.PromoStore || null;
  if (promoObj && !promoObj.code && PromoURL.get?.()) {
    // Hydrate code if store lacks it but URL has it
    promoObj.code = PromoURL.get();
  }

  const { ctaLabel, footnote } = priceView({ plan, billing, promo: promoObj });

  // Base href → add billing → add promo
  const base = `/checkout?plan=${plan}`;
  const withBilling = BillingURL.applyToUrl(base, { value: billing, force: !!opts?.forceBilling });
  const href = PromoURL.applyToUrl(withBilling);

  const analytics = {
    plan,
    billing,
    promo: PromoURL.get?.() || (promoObj?.code || null)
  };

  return {
    href,
    label: ctaLabel,
    footnote,
    plan,
    billing,
    hasPromo: !!analytics.promo,
    analytics
  };
}

/**
 * Optional: small helper for click tracking
 */
export function trackCheckoutClick(meta = {}) {
  try {
    // Replace with your analytics client if present
    window.dispatchEvent(new CustomEvent("track", { detail: { event: "checkout_cta_click", ...meta }}));
  } catch {}
}