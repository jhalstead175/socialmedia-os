import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { trackEvent, trackPageView } from "@/components/shared/Analytics";
import { usePromoStore } from "@/components/marketing/PromoStore";
import { PromoURL } from "@/components/marketing/PromoURL";
import { BillingURL } from "@/components/subscription/BillingURL";

// Import new landing page components
import { BrandHeaderV2 } from "../components/landing/BrandHeader";
import { HeroFullBleedV3 } from "../components/landing/HeroFullBleedV3";
import { TrustBadgesRow } from "../components/landing/TrustBadgesRow";
import TemplatesGallery from "../components/landing/TemplatesGallery";
import { PricingPlansV2 } from "../components/landing/PricingPlansV2";
import PromoBanner from '../components/marketing/PromoBanner';
import WhatsNew from '../components/marketing/WhatsNew';
import { FooterSitemapV2 } from "../components/landing/FooterSitemap";

export default function Landing() {
  const [annual, setAnnual] = useState(true);
  const navigate = useNavigate();
  const promo = usePromoStore();

  useEffect(() => {
    trackPageView('landing');
    document.documentElement.style.scrollBehavior = 'smooth';
    
    BillingURL.syncFromCurrentUrl();
    PromoURL.syncFromCurrentUrl();
    promo.loadFromUrl();

    const handleBillingChange = (e) => setAnnual(e.detail?.billing === 'annual');
    window.addEventListener('billing:changed', handleBillingChange);

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      window.removeEventListener('billing:changed', handleBillingChange);
    };
  }, [promo]);

  const handleCheckout = (plan) => {
    const baseUrl = createPageUrl(`Checkout?plan=${plan}`);
    const withBilling = BillingURL.applyToUrl(baseUrl);
    const href = PromoURL.applyToUrl(withBilling);
    
    trackEvent('tier_cta_click', { 
      plan, 
      billing: BillingURL.get() || 'annual', 
      has_promo: promo.valid,
      promo_code: promo.valid ? promo.code : null
    });
    
    navigate(href);
  };

  const handleBillingToggle = (newBilling) => {
    setAnnual(newBilling === 'annual');
    BillingURL.set(newBilling);
  };

  const scrollToSection = (sectionId, trackingData = {}) => {
    trackEvent('hero_cta_click', trackingData);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#0B0D15] text-zinc-100 flex flex-col">
      <PromoBanner surface="Landing" />
      
      {/* Header */}
      <BrandHeaderV2 onCta={() => navigate(createPageUrl("Signin"))} />

      {/* Full-bleed Hero */}
      <HeroFullBleedV3 
        heroImageUrl="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        onPrimary={() => navigate(createPageUrl("Signin"))} 
        onSecondary={() => scrollToSection('features')} 
      />

      {/* Trust Badges row */}
      <TrustBadgesRow />

      {/* Features Section */}
      <section id="features" className="py-16 bg-zinc-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Built to Win Offers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Role-Tailored Resumes", desc: "Paste a JD, click tailor, and get keyword-aware bullets with measurable impact.", icon: "⚡" },
              { title: "Executive & Legal Templates", desc: "Clean, ATS-ready designs for senior roles and regulated fields.", icon: "👑" },
              { title: "Interview Simulator", desc: "Mock panels, STAR prompts, and real-time coaching.", icon: "⭐" },
              { title: "Cover Letters & Outreach", desc: "On-brand, concise, and tuned to the company's voice.", icon: "✉️" },
              { title: "LinkedIn Optimizer", desc: "Headlines, About, and Experience sections tuned for your role.", icon: "💼" },
              { title: "Metrics & Progress", desc: "Track applications, callbacks, and pass rates.", icon: "📊" }
            ].map(feature => (
              <div key={feature.title} className="bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700">
                <div className="text-2xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates gallery */}
      <section id="templates" className="py-16 bg-zinc-900">
        <TemplatesGallery />
      </section>

      <WhatsNew />
      
      {/* Pricing plans */}
      <section id="pricing" className="py-16 bg-zinc-900">
        <PricingPlansV2 
          cycle={annual ? 'annual' : 'monthly'}
          onSelect={handleCheckout}
          onCycleChange={handleBillingToggle}
        />
      </section>

      {/* Footer */}
      <FooterSitemapV2 />
    </main>
  );
}