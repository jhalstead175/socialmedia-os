import React, { useEffect } from 'react';
import { trackEvent } from '@/components/shared/Analytics';
import { usePromoStore } from '../marketing/PromoStore';
import { PromoURL } from '../marketing/PromoURL';
import { BillingURL } from '../subscription/BillingURL';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PRICE = {
  pro:   { monthly: 19,  annual: 144 },
  elite: { monthly: 49,  annual: 468 }
};

function annualSavingsPct(plan = "pro") {
  if (!PRICE[plan]) return 0;
  const m = PRICE[plan].monthly * 12;
  const y = PRICE[plan].annual;
  if (m <= 0 || y <= 0) return 0;
  const pct = Math.max(0, Math.round((1 - y / m) * 100));
  return pct;
}

// Global function for inline onclick handlers
window.onHurryTap = function({ location = "drawer", plan = null }) {
  const previous = (BillingURL.get && BillingURL.get()) || "annual";
  const suggested = plan || window.__rezemai_quiz_plan || "pro";
  
  BillingURL.set("annual", { replaceHistory: true });

  const pct = annualSavingsPct(suggested);
  const base = createPageUrl(`Checkout?plan=${suggested}`);
  const withBilling = BillingURL.applyToUrl(base, { value: "annual", force: true });
  const href = PromoURL.applyToUrl(withBilling);

  // Analytics
  try {
    window.dispatchEvent(new CustomEvent("track", { 
      detail: { 
        event: "hurry_chip_click", 
        location, 
        from: previous, 
        to: "annual", 
        plan: suggested 
      }
    }));
  } catch {}

  // Toast notification
  const promoLabel = window.PromoStore?.code ? `Continue — ${window.PromoStore.code}` : "Continue to checkout";
  
  toast("Annual selected", {
    description: `Save ~${pct}% vs paying monthly.`,
    duration: 8000,
    position: "bottom-center",
    action: {
      label: promoLabel,
      onClick: () => {
        try { 
          window.dispatchEvent(new CustomEvent("track", { 
            detail: { 
              event: "hurry_chip_checkout_click", 
              plan: suggested, 
              promo: window.PromoStore?.code || null 
            }
          })); 
        } catch {}
        window.location.assign(href);
      }
    },
    cancel: {
      label: "Undo",
      onClick: () => {
        try {
          window.dispatchEvent(new CustomEvent("track", { 
            detail: { event: "hurry_chip_undo", to: previous }
          }));
        } catch {}
        BillingURL.set(previous);
      }
    }
  });
};

export default function HurryChip({ location = "drawer", quizPlan, className = '' }) {
  const promo = usePromoStore();
  const navigate = useNavigate();

  useEffect(() => {
    trackEvent('hurry_chip_impression', { location });
    
    // Make promo store available globally for the handler
    window.PromoStore = promo;
    window.__rezemai_quiz_plan = quizPlan;
  }, [location, promo, quizPlan]);

  const handleClick = () => {
    window.onHurryTap({ location, plan: quizPlan });
  };

  return (
    <button 
      className={`badge btn-pill hurry-chip cursor-pointer border border-white/15 bg-white/10 hover:bg-white/20 text-white/80 transition-colors ${className}`}
      onClick={handleClick}
      title="Switch to Annual pricing and jump to checkout with your promo applied."
      style={{ border: '1px solid rgba(255,255,255,0.16)' }}
    >
      I'm in a hurry — show best savings
    </button>
  );
}

// Alternative: Pure HTML button for direct use
export const HurryChipHTML = ({ location = "drawer", className = "" }) => {
  return `
    <button 
      class="badge btn-pill hurry-chip cursor-pointer ${className}" 
      onclick="onHurryTap({ location: '${location}' })"
      title="Switch to Annual pricing and jump to checkout with your promo applied."
      style="border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8);"
    >
      I'm in a hurry — show best savings
    </button>
  `;
};