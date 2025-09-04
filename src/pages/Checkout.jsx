
import React, { useState, useEffect, useCallback } from "react";
import { User, PromoRedemption } from "@/api/entities";
import { createCheckoutSession } from "@/api/functions";
import { validatePromo } from "@/api/functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Crown, Zap, ArrowRight, Loader2, Tag, XCircle } from "lucide-react";
import { trackEvent } from "@/components/shared/Analytics";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

// A simple utility to handle promo code in URL for cleanup
const PromoURL = {
  has: () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('promo');
  },
  remove: ({ replaceHistory = false } = {}) => {
    const url = new URL(window.location.href);
    url.searchParams.delete('promo');
    if (replaceHistory) {
      window.history.replaceState({}, '', url.toString());
    } else {
      window.history.pushState({}, '', url.toString());
    }
  }
};

export default function Checkout() {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Promo state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Get plan and billing from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const plan = urlParams.get('plan') || 'pro';
  const billing = urlParams.get('billing') || 'monthly';
  const initialPromo = urlParams.get('promo');

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      // User not logged in, redirect to login with callback
      const callbackUrl = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      await User.loginWithRedirect(callbackUrl);
      return null;
    }
  }, []);

  const handleValidatePromo = useCallback(async (codeToValidate, currentUser) => {
    if (!codeToValidate || !currentUser) {
      toast.error('Promo code and user must be provided.');
      return;
    }
    setIsValidatingPromo(true);
    trackEvent('promo_validate', { code: codeToValidate, plan, billing });
    
    try {
      const { data: result } = await validatePromo({
        code: codeToValidate,
        plan,
        billing,
        user_id: currentUser.id
      });

      if (result.valid) {
        setAppliedPromo(result.promo);
        toast.success(`Promo "${result.promo.label}" applied!`);
        trackEvent('promo_apply', { code: result.promo.code, plan, billing });
      } else {
        setAppliedPromo(null);
        toast.error(result.reason || 'Invalid promo code.');
      }
    } catch (error) {
      console.error('Validate promo error:', error);
      toast.error('Could not validate promo code.');
    }
    setIsValidatingPromo(false);
  }, [plan, billing]);

  useEffect(() => {
    // Clean the URL once checkout starts for better UX
    if (PromoURL.has()) {
      setTimeout(() => {
        PromoURL.remove({ replaceHistory: true });
      }, 1000);
    }
    
    const initializeCheckout = async () => {
      const currentUser = await checkAuth();
      if (initialPromo && currentUser) {
        setPromoCode(initialPromo);
        handleValidatePromo(initialPromo, currentUser);
      }
    };
    initializeCheckout();
  }, [checkAuth, initialPromo, handleValidatePromo]);

  const handleCheckout = async () => {
    if (!user) return; // Should not happen if checkAuth works, but as a safeguard
    
    setIsLoading(true);
    
    try {
      trackEvent('checkout_init', { plan, billing, promo: appliedPromo?.code });
      
      let pendingRedemptionId = null;
      if (appliedPromo) {
          const redemption = await PromoRedemption.create({
              promo_id: appliedPromo.id,
              user_id: user.id,
              plan,
              billing,
              status: 'applied' // Mark as applied before redirect
          });
          pendingRedemptionId = redemption.id;
      }

      const response = await createCheckoutSession({ 
        plan, 
        billing,
        promo_id: appliedPromo?.id, // Pass promo_id to backend
        redemption_id: pendingRedemptionId // Pass pending redemption ID
      });
      
      if (response.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error(response.data.error || 'No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(`Checkout failed: ${error.message || 'Please try again.'}`);
      setIsLoading(false);
    }
  };

  const planDetails = {
    pro: {
      name: 'Pro',
      monthlyPrice: 19,
      annualPrice: 12,
      icon: Crown,
      color: 'blue',
      features: [
        'Unlimited résumés & versions',
        'Role-tuned AI bullet rewrites',
        'Cover letters & outreach emails',
        'Advanced interview drills with feedback',
        'LinkedIn profile optimizer',
        'Priority support'
      ]
    },
    elite: {
      name: 'Elite',
      monthlyPrice: 49,
      annualPrice: 39,
      icon: Zap,
      color: 'purple',
      features: [
        'Everything in Pro, plus:',
        'Executive narrative crafting',
        'Premium industry-specific templates',
        'Panel-style interview simulator',
        'Personal brand strategy kit',
        'White-glove onboarding'
      ]
    }
  };

  const selectedPlan = planDetails[plan];
  const Icon = selectedPlan?.icon || Crown;
  // Calculate final price. If promo is applied, the price might be modified on the backend,
  // but for display purposes, we keep the original base price here.
  const price = billing === 'annual' ? selectedPlan?.annualPrice : selectedPlan?.monthlyPrice;
  const savings = billing === 'annual' ? Math.round(((selectedPlan?.monthlyPrice * 12) - (selectedPlan?.annualPrice * 12)) / (selectedPlan?.monthlyPrice * 12) * 100) : 0;

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">Invalid plan selected</p>
            <Button onClick={() => navigate(createPageUrl('Landing'))}>
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-0 shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            selectedPlan.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
          }`}>
            <Icon className={`w-8 h-8 ${
              selectedPlan.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
            }`} />
          </div>
          <CardTitle className="text-2xl font-bold text-navy">
            Upgrade to {selectedPlan.name}
          </CardTitle>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="text-3xl font-bold text-navy">
              ${price}
              <span className="text-lg text-slate-600">/month</span>
            </div>
            {billing === 'annual' && (
              <Badge className="bg-green-100 text-green-800">
                Save {savings}%
              </Badge>
            )}
          </div>
          <p className="text-slate-600 mt-2">
            {billing === 'annual' ? 'Billed annually' : 'Billed monthly'}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-navy mb-3">What's included:</h4>
            <ul className="space-y-2">
              {selectedPlan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Promo Code Section */}
          <div>
            <Label htmlFor="promo-code">Promo Code</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                id="promo-code"
                placeholder="ENTERCODE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromo}
              />
              <Button 
                variant="outline"
                onClick={() => handleValidatePromo(promoCode, user)}
                disabled={isValidatingPromo || !promoCode || !!appliedPromo || !user}
              >
                {isValidatingPromo ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Apply'}
              </Button>
            </div>
            {appliedPromo && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">{appliedPromo.label}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => { 
                    setAppliedPromo(null); 
                    setPromoCode(''); 
                    toast.info('Promo code removed.');
                  }}
                >
                  <XCircle className="w-4 h-4 text-slate-500" />
                  <span className="sr-only">Remove promo code</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button
            onClick={handleCheckout}
            disabled={isLoading || !user}
            className="w-full bg-navy hover:bg-navy/90 text-warm-white py-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Continue to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Landing'))}
            className="w-full text-slate-600"
          >
            Back to Pricing
          </Button>

          <div className="text-center w-full">
            <p className="text-xs text-slate-500">
              Secure checkout powered by Stripe • Cancel anytime
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
