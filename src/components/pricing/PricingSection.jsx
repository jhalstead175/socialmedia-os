import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClerkAuth } from '@/api/clerkClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const PRICING_TIERS = {
  free: {
    name: "Free",
    price: "$0",
    period: "/forever",
    description: "Get started with basic features",
    features: [
      "Connect 1 social account",
      "5 scheduled posts per month",
      "Basic analytics",
      "Post to LinkedIn & Twitter"
    ],
    cta: "Start Free",
    highlighted: false
  },
  pro: {
    name: "Pro",
    price: "$29",
    period: "/mo",
    description: "Perfect for professionals",
    features: [
      "Everything in Free",
      "Connect unlimited accounts",
      "Unlimited scheduled posts",
      "Advanced analytics & insights",
      "Multi-platform publishing",
      "Content calendar",
      "Email support"
    ],
    cta: "Get Pro",
    highlighted: true
  },
  business: {
    name: "Business",
    price: "$79",
    period: "/mo",
    description: "For teams and agencies",
    features: [
      "Everything in Pro",
      "Team collaboration (up to 5 users)",
      "Campaign management",
      "White-label reports",
      "API access",
      "Priority support",
      "Custom integrations"
    ],
    cta: "Get Business",
    highlighted: false
  }
};

export function PricingSection() {
  const { isAuthenticated } = useClerkAuth();
  const navigate = useNavigate();

  const handlePlanSelect = async (tier) => {
    if (!isAuthenticated) {
      // Redirect to sign in
      navigate(createPageUrl('Signin'));
      return;
    }

    if (tier === 'free') {
      // Free plan - go to dashboard
      navigate(createPageUrl('Dashboard'));
    } else {
      // Paid plans - go to checkout
      const plan = tier.toUpperCase();
      navigate(createPageUrl('Checkout') + `?plan=${plan}`);
    }
  };

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 bg-[#0B0F14]">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl tracking-tight font-semibold mb-4 text-zinc-100">
          Choose Your Plan
        </h2>
        <p className="text-lg leading-relaxed max-w-2xl mx-auto text-zinc-400">
          No contracts. Cancel anytime. Start free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <Card
            key={key}
            className={`rounded-xl border relative overflow-hidden ${
              tier.highlighted
                ? 'bg-[#111827] border-[#10B981] border-2'
                : 'bg-transparent border-[#1F2937]'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute top-0 left-0 right-0 text-center py-2 text-sm font-semibold bg-[#10B981] text-[#0B0F14]">
                Most Popular
              </div>
            )}

            <div className={`p-8 ${tier.highlighted ? 'pt-16' : ''}`}>
              <h3 className="text-2xl font-semibold mb-2 text-zinc-100">
                {tier.name}
              </h3>

              <div className="mb-4 text-zinc-400">
                {tier.description}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-zinc-100">
                  {tier.price}
                </span>
                <span className="text-zinc-400">{tier.period}</span>
              </div>

              <Button
                onClick={() => handlePlanSelect(key)}
                className={`w-full mb-6 rounded-lg ${
                  tier.highlighted
                    ? 'bg-[#10B981] hover:bg-[#059669] text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                }`}
              >
                {tier.cta}
              </Button>

              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-zinc-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

export default PricingSection;
