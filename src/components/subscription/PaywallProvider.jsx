
import React, { useState, useContext, createContext, useCallback, useEffect } from "react";
import { User } from "@/api/entities";
import { trackEvent } from "@/components/shared/Analytics";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown, Zap, CheckCircle, ShieldCheck, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { copyLines } from "./paywallCopy";
import { usePromoStore } from "../marketing/PromoStore";
import { PromoURL } from "../marketing/PromoURL";
import { BillingURL } from "./BillingURL";
import { toast } from "sonner";

const PaywallContext = createContext(null);

const planHierarchy = {
  starter: 0,
  pro: 1,
  elite: 2,
};

const getCurrentBillingToggle = () => {
  // Use BillingURL to get current billing preference
  return BillingURL.get() || 'annual';
};

const PaywallModal = ({ isOpen, onClose, minPlan, featureKey }) => {
  const navigate = useNavigate();
  const promo = usePromoStore();
  const billing = getCurrentBillingToggle();

  // Determine primary and secondary plans
  const primaryPlan = minPlan === 'elite' ? 'elite' : 'pro';
  const secondaryPlan = primaryPlan === 'elite' ? 'pro' : 'elite';

  // Plan details for pricing calculation
  const planDetails = {
    pro: { monthlyPrice: 19, annualPrice: 144 },
    elite: { monthlyPrice: 49, annualPrice: 468 }
  };

  const computePricingLabel = (plan, currentBilling) => {
    if (!promo.valid || !promo.applies_to_plans.includes(plan) || !promo.applies_to_billing.includes(currentBilling)) {
      return `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    }

    const planData = planDetails[plan];
    const originalPrice = currentBilling === 'annual' ? planData.annualPrice : planData.monthlyPrice;
    const discountedPrice = promo.calculateDiscountedPrice(originalPrice, currentBilling);
    
    const { type, value_number, duration, duration_in_months } = promo;
    const billingUnit = currentBilling === 'annual' ? '/yr' : '/mo';
    
    if (type === 'percent') {
      if (duration === 'repeating') {
        const period = currentBilling === 'annual' ? Math.round(duration_in_months / 12) : duration_in_months;
        const periodUnit = currentBilling === 'annual' ? 'yr' : 'mo';
        return `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}${billingUnit} (first ${period} ${periodUnit})`;
      } else if (duration === 'once') {
        return currentBilling === 'annual' 
          ? `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}/yr first year`
          : `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}/mo first month`;
      } else { // 'forever'
        return `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}${billingUnit} forever`;
      }
    } else { // fixed_amount
      if (duration === 'once') {
        return currentBilling === 'annual'
          ? `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}/yr first year`
          : `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}/mo first month`;
      } else if (duration === 'repeating') {
        const period = currentBilling === 'annual' ? Math.round(duration_in_months / 12) : duration_in_months;
        const periodUnit = currentBilling === 'annual' ? 'yr' : 'mo';
        return `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}${billingUnit} (first ${period} ${periodUnit})`;
      } else { // 'forever'
        return `Apply ${promo.code} & Upgrade — $${Math.round(discountedPrice)}${billingUnit} forever`;
      }
    }
  };

  const handleUpgrade = (targetPlan) => {
    try {
      trackEvent('paywall_cta_click', { 
        plan: targetPlan, 
        featureKey, 
        promo: promo.valid ? promo.code : null,
        billing 
      });
      
      const baseUrl = createPageUrl(`Checkout?plan=${targetPlan}`);
      // 1) Add billing param; 2) Add promo param (if present)
      const finalUrl = PromoURL.applyToUrl(BillingURL.applyToUrl(baseUrl, { value: billing }));
      
      navigate(finalUrl);
      onClose();
    } catch (error) {
      console.error('Navigation error:', error);
      toast.error("We couldn't start checkout. Please try again.");
    }
  };

  // Add null checks and default values
  const safePlan = minPlan || 'pro'; // Used for `copyLines` to determine feature copy
  const safeFeatureKey = featureKey || 'premium_feature';
  const copy = copyLines[safeFeatureKey] || { 
    headline: 'Unlock this Premium Feature', 
    bullets: ['Get access to all our advanced tools.', 'Upgrade your plan today.'] 
  };

  const primaryLabel = computePricingLabel(primaryPlan, billing);
  const secondaryLabel = computePricingLabel(secondaryPlan, billing); // Also compute for secondary plan

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/10 text-white">
        {/* Promo Banner */}
        {promo.valid && (
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-amber-200">
              <Tag className="w-4 h-4" />
              <span className="text-sm font-medium">
                Promo {promo.code} detected — {promo.message}
              </span>
            </div>
          </div>
        )}
        
        {promo.code && !promo.valid && (
          <div className="mb-4 p-3 bg-slate-800 border border-slate-600 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300">
              <Tag className="w-4 h-4" />
              <span className="text-sm">
                Promo {promo.code} applies to {promo.applies_to_plans?.join(', ')} plan(s) on {promo.applies_to_billing?.join(' or ')} billing. You can still upgrade now.
              </span>
            </div>
          </div>
        )}

        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-400 mx-auto mb-4">
            {primaryPlan === 'pro' ? <Crown className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
          </div>
          <DialogTitle className="text-center text-2xl font-bold">
            Unlock with {primaryPlan.charAt(0).toUpperCase() + primaryPlan.slice(1)}
          </DialogTitle>
          <DialogDescription className="text-center text-white/70">
            {copy.headline}
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <ul className="space-y-2">
            {copy.bullets.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/85">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-center text-xs text-white/50 mb-4 flex items-center justify-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            Cancel anytime. Secure checkout with Stripe.
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={() => handleUpgrade(primaryPlan)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm"
          >
            {primaryLabel}
          </Button>
          <Button
            onClick={() => handleUpgrade(secondaryPlan)}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white"
          >
            {secondaryLabel}
          </Button>
        </div>
        <Button variant="ghost" onClick={onClose} className="w-full mt-2 text-white/60 hover:text-white">
          Not now
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export const PaywallProvider = ({ children }) => {
  const [modalState, setModalState] = useState({ isOpen: false, minPlan: null, featureKey: null });
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    User.me().then(user => {
      setCurrentUser(user);
    }).catch(() => {
      setCurrentUser(null);
    }).finally(() => {
      setIsLoadingUser(false);
    });
  }, []);

  const requirePlan = useCallback((minPlan, featureKey) => {
    if (isLoadingUser) return false;
    
    const userPlan = currentUser?.plan || 'starter';
    if (planHierarchy[userPlan] >= planHierarchy[minPlan]) {
      return true;
    } else {
      trackEvent('paywall_view', { minPlan, featureKey });
      setModalState({ isOpen: true, minPlan, featureKey });
      return false;
    }
  }, [currentUser, isLoadingUser]);

  const value = { requirePlan };

  return (
    <PaywallContext.Provider value={value}>
      {children}
      <PaywallModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, minPlan: null, featureKey: null })}
        minPlan={modalState.minPlan}
        featureKey={modalState.featureKey}
      />
    </PaywallContext.Provider>
  );
};

export const usePaywall = () => {
  const context = useContext(PaywallContext);
  if (!context) {
    throw new Error('usePaywall must be used within a PaywallProvider');
  }
  return context;
};
