import React from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BrandHeaderV2 } from "../components/landing/BrandHeader";
import { FooterSitemapV2 } from "../components/landing/FooterSitemap";

export default function ContactPage() {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-[#0B0D15] text-zinc-100">
      <BrandHeaderV2 onCta={() => navigate(createPageUrl("Signin"))} />
      <section className="mx-auto max-w-7xl px-6 md:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Contact</h1>
        <p className="mt-2 text-zinc-400">We'll get back within 1 business day.</p>
      </section>
      <FooterSitemapV2 />
    </main>
  );
}