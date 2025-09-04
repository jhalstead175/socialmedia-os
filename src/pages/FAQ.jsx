import React from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BrandHeaderV2 } from "../components/landing/BrandHeader";
import { FooterSitemapV2 } from "../components/landing/FooterSitemap";

export default function FaqPage() {
  const navigate = useNavigate();
  
  return (
    <main className="min-h-screen bg-[#0B0D15] text-zinc-100">
      <BrandHeaderV2 onCta={() => navigate(createPageUrl("Signin"))} />
      <section className="mx-auto max-w-7xl px-6 md:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">FAQ</h1>
        <ul className="mt-4 space-y-2 text-zinc-300">
          <li><strong>Is it ATS‑friendly?</strong> Yes, our templates parse cleanly.</li>
          <li><strong>Can I import my resume?</strong> Yes, paste or upload to start.</li>
          <li><strong>Who is Rezemai for?</strong> Professionals seeking faster offers.</li>
        </ul>
      </section>
      <FooterSitemapV2 />
    </main>
  );
}