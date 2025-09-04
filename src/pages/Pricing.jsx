import React from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BrandHeaderV2 } from "../components/landing/BrandHeader";
import { FooterSitemapV2 } from "../components/landing/FooterSitemap";
import { PricingPlansV2 } from "../components/landing/PricingPlansV2";

export default function PricingPage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-[#0B0D15] text-zinc-100">
      <BrandHeaderV2 onCta={() => navigate(createPageUrl("Signin"))} />
      <PricingPlansV2 cycle="annual" onSelect={(plan) => navigate(createPageUrl(`Checkout?plan=${plan}`))} />
      <FooterSitemapV2 />
    </main>
  );
}