import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Watermark from "@/components/Watermark";

export default function Landing() {
  const navigate = useNavigate();

  console.log("Rendering Landing page");

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F1A] via-[#0E1424] to-black" />

      {/* Watermark Layer */}
      <Watermark />

      {/* Main Content */}
      <main className="relative z-10 px-6 max-w-7xl mx-auto">
        <Header />

        {/* Hero */}
        <section className="max-w-3xl py-24">
          <h1 className="text-5xl font-semibold tracking-tight">
            Professional social media operations
          </h1>

          <p className="mt-6 text-xl text-slate-300">
            Agency-grade management for executives, teams, and regulated industries.
          </p>

          <div className="mt-10 flex gap-4">
            <button
              onClick={() => navigate(createPageUrl("Signin"))}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
            >
              Get Started
            </button>
            <button
              className="rounded-lg border border-slate-700 px-6 py-3 text-slate-200 hover:bg-slate-800 transition-colors"
              onClick={() => scrollToSection('pricing')}
            >
              View Pricing
            </button>
          </div>
        </section>

        {/* Additional Sections */}
        {/* What SoshlOps Does */}
        {/* Capabilities */}
        {/* Who It's For */}
        {/* How It Works */}
        {/* Why SoshlOps */}
        {/* Pricing */}
        {/* Final CTA */}

        <Footer />
      </main>
    </div>
  );
}
