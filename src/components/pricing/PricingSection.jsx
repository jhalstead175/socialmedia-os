import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PRICING_TIERS, theme } from '@/styles/rezemai.tokens';
import { useClerkAuth } from '@/api/clerkClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
    <section
      className={`${theme.spacing.section} ${theme.spacing.container}`}
      style={{ backgroundColor: theme.colors.bg }}
    >
      <div className="text-center mb-16">
        <h2
          className={`text-4xl md:text-5xl ${theme.typography.headings} mb-4`}
          style={{ color: theme.colors.textPrimary }}
        >
          Choose Your Plan
        </h2>
        <p
          className={`text-lg ${theme.typography.body} max-w-2xl mx-auto`}
          style={{ color: theme.colors.textSecondary }}
        >
          No contracts. Cancel anytime. Start free.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
          <Card
            key={key}
            className={`${theme.radius.card} border relative overflow-hidden`}
            style={{
              backgroundColor: tier.highlighted ? theme.colors.panel : 'transparent',
              borderColor: tier.highlighted ? theme.colors.accent : theme.colors.border,
              borderWidth: tier.highlighted ? '2px' : '1px'
            }}
          >
            {tier.highlighted && (
              <div
                className="absolute top-0 left-0 right-0 text-center py-2 text-sm font-semibold"
                style={{
                  backgroundColor: theme.colors.accent,
                  color: theme.colors.bg
                }}
              >
                Most Popular
              </div>
            )}

            <div className={`p-8 ${tier.highlighted ? 'pt-16' : ''}`}>
              <h3
                className="text-2xl font-semibold mb-2"
                style={{ color: theme.colors.textPrimary }}
              >
                {tier.name}
              </h3>

              <div className="mb-4">
                <span
                  className="text-5xl font-bold"
                  style={{ color: theme.colors.textPrimary }}
                >
                  {tier.price}
                </span>
                <span
                  className="text-lg"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {tier.period}
                </span>
              </div>

              <p
                className="mb-6"
                style={{ color: theme.colors.textSecondary }}
              >
                {tier.description}
              </p>

              <Button
                onClick={() => handlePlanSelect(key)}
                className={`w-full mb-8 ${theme.radius.button} font-medium h-12`}
                style={{
                  backgroundColor: tier.highlighted ? theme.colors.accent : theme.colors.panel,
                  color: theme.colors.textPrimary,
                  borderColor: tier.highlighted ? 'transparent' : theme.colors.border,
                  borderWidth: tier.highlighted ? '0' : '1px'
                }}
              >
                {tier.cta}
              </Button>

              <ul className="space-y-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: theme.colors.accent }}
                    />
                    <span style={{ color: theme.colors.textSecondary }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>

      <p
        className="text-center mt-12 text-sm"
        style={{ color: theme.colors.textSecondary }}
      >
        No templates. No spam. Private by design.
      </p>
    </section>
  );
}
