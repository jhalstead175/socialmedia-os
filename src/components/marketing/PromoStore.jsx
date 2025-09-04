
import React from 'react';
import { validatePromo } from '@/api/functions';
import { trackEvent } from '@/components/shared/Analytics';

class PromoStore {
  constructor() {
    this.state = {
      code: '',
      valid: false,
      type: null,
      value_number: 0,
      duration: null,
      duration_in_months: null,
      applies_to_plans: [],
      applies_to_billing: [],
      message: '',
      loading: false,
      error: null
    };
    this.listeners = [];
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  computeMessage(promo) {
    const { type, value_number, duration, duration_in_months } = promo;
    
    if (type === 'percent') {
      if (duration === 'repeating') {
        return `Save ${value_number}% for your first ${duration_in_months} months.`;
      } else if (duration === 'once') {
        return `Save ${value_number}% on your first charge.`;
      } else {
        return `Save ${value_number}% on all future renewals.`;
      }
    } else {
      const dollarAmount = (value_number / 100).toFixed(2);
      if (duration === 'repeating') {
        return `Save $${dollarAmount}/mo for ${duration_in_months} months.`;
      } else if (duration === 'once') {
        return `Save $${dollarAmount} on your first charge.`;
      } else {
        return `Save $${dollarAmount} every renewal.`;
      }
    }
  }

  async loadFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoCode = urlParams.get('promo');
    
    if (promoCode) {
      await this.apply(promoCode, 'pro', 'annual', false); // Silent probe
    }
  }

  async apply(code, plan = 'pro', billing = 'annual', trackAnalytics = true) {
    if (!code.trim()) {
      this.setState({
        code: '',
        valid: false,
        error: 'Please enter a promo code',
        message: ''
      });
      return;
    }

    this.setState({ 
      loading: true, 
      error: null,
      code: code.toUpperCase()
    });

    if (trackAnalytics) {
      trackEvent('promo_apply_click', { code: code.toUpperCase() });
    }

    try {
      const { data } = await validatePromo({
        code: code.toUpperCase(),
        plan,
        billing,
        user_id: 'guest' // We don't have user context on landing page
      });

      if (data.valid) {
        const message = this.computeMessage(data.promo);
        
        this.setState({
          valid: true,
          type: data.promo.type,
          value_number: data.promo.value_number,
          duration: data.promo.duration,
          duration_in_months: data.promo.duration_in_months,
          applies_to_plans: data.promo.applies_to_plans || [],
          applies_to_billing: data.promo.applies_to_billing || [],
          message,
          loading: false,
          error: null
        });

        if (trackAnalytics) {
          trackEvent('promo_validate', { 
            code: code.toUpperCase(), 
            plan, 
            billing, 
            result: 'valid' 
          });
        }
      } else {
        this.setState({
          valid: false,
          loading: false,
          error: data.reason || 'Invalid promo code',
          message: ''
        });

        if (trackAnalytics) {
          trackEvent('promo_validate', { 
            code: code.toUpperCase(), 
            plan, 
            billing, 
            result: 'invalid',
            reason: data.reason
          });
        }
      }
    } catch (error) {
      this.setState({
        valid: false,
        loading: false,
        error: 'Unable to validate promo code. Please try again.',
        message: ''
      });

      console.error('Promo validation error:', error);
    }
  }

  clear() {
    this.setState({
      code: '',
      valid: false,
      type: null,
      value_number: 0,
      duration: null,
      duration_in_months: null,
      applies_to_plans: [],
      applies_to_billing: [],
      message: '',
      loading: false,
      error: null
    });
  }

  calculateDiscountedPrice(originalPrice, billing) {
    if (!this.state.valid) return originalPrice;

    const { type, value_number, duration, duration_in_months } = this.state;
    
    if (type === 'percent') {
      return originalPrice * (1 - value_number / 100);
    } else {
      // fixed_amount
      const discountAmount = value_number / 100;
      if (billing === 'annual' && duration === 'repeating') {
        return Math.max(originalPrice - (discountAmount * (duration_in_months || 1)), 0);
      } else if (billing === 'annual' && duration === 'once') {
        return Math.max(originalPrice - discountAmount, 0);
      } else {
        return Math.max(originalPrice - discountAmount, 0);
      }
    }
  }

  getDiscountDisplayText(originalPrice, discountedPrice, billing) {
    if (!this.state.valid) return null;

    const { duration, duration_in_months, value_number, type } = this.state;
    const suffix = billing === 'monthly' ? '/mo' : '/yr';
    
    if (type === 'percent') {
      if (duration === 'repeating') {
        return `$${originalPrice}${suffix} → $${Math.round(discountedPrice)}${suffix} (first ${duration_in_months} ${billing === 'monthly' ? 'mo' : 'yr'})`;
      } else if (duration === 'once') {
        return billing === 'monthly' 
          ? `$${Math.round(discountedPrice)} first month, then $${originalPrice}`
          : `$${Math.round(discountedPrice)} first year, then $${originalPrice}`;
      } else {
        return `$${originalPrice}${suffix} → $${Math.round(discountedPrice)}${suffix} forever`;
      }
    } else {
      // fixed_amount logic similar to percent but with dollar amounts
      if (duration === 'once') {
        return billing === 'monthly'
          ? `$${Math.round(discountedPrice)} first month, then $${originalPrice}`
          : `$${Math.round(discountedPrice)} first year, then $${originalPrice}`;
      } else if (duration === 'repeating') {
        return `$${originalPrice}${suffix} → $${Math.round(discountedPrice)}${suffix} (first ${duration_in_months} ${billing === 'monthly' ? 'mo' : 'yr'})`;
      } else {
        return `$${originalPrice}${suffix} → $${Math.round(discountedPrice)}${suffix} forever`;
      }
    }
  }

  isApplicableForPlan(plan, billing) {
    if (!this.state.valid) return false;
    return this.state.applies_to_plans.includes(plan) && this.state.applies_to_billing.includes(billing);
  }

  getEligibilityMessage() {
    if (!this.state.valid || this.state.applies_to_plans.length === 0) return '';
    
    const planText = this.state.applies_to_plans.join(', ');
    const billingText = this.state.applies_to_billing.join(' and ');
    return `Promo applies to ${billingText} billing on ${planText}.`;
  }
}

// Create singleton instance
export const promoStore = new PromoStore();

// React hook for easy integration
export const usePromoStore = () => {
  const [state, setState] = React.useState(promoStore.state);
  
  React.useEffect(() => {
    return promoStore.subscribe(setState);
  }, []);
  
  return {
    ...state,
    apply: promoStore.apply.bind(promoStore),
    clear: promoStore.clear.bind(promoStore),
    loadFromUrl: promoStore.loadFromUrl.bind(promoStore),
    calculateDiscountedPrice: promoStore.calculateDiscountedPrice.bind(promoStore),
    getDiscountDisplayText: promoStore.getDiscountDisplayText.bind(promoStore),
    isApplicableForPlan: promoStore.isApplicableForPlan.bind(promoStore),
    getEligibilityMessage: promoStore.getEligibilityMessage.bind(promoStore)
  };
};
