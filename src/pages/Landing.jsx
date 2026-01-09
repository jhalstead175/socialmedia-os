import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <main className="px-6 max-w-7xl mx-auto">
      <Header />

      {/* Hero */}
      <section className="max-w-3xl py-24">
        <h1 className="text-5xl font-semibold tracking-tight">
          Professional Social Media Management.
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          Agency-grade operations for executives, teams, and regulated industries.
        </p>

        <div className="mt-10 flex gap-4">
          <button
            onClick={() => navigate(createPageUrl("Signin"))}
            className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
          >
            Get Early Access
          </button>
          <button
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-200 hover:bg-slate-800 transition-colors"
            onClick={() => scrollToSection('how-it-works')}
          >
            How It Works
          </button>
        </div>
      </section>

      {/* Authority */}
      <section className="border-t border-slate-800 pt-16 text-slate-300">
        Built for agencies, corporate communications, and professionals who value precision and control.
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-24 max-w-2xl space-y-4 text-slate-300">
        <p>1. Connect your social accounts</p>
        <p>2. Create and schedule posts across platforms</p>
        <p>3. Track performance and manage engagement</p>
      </section>

      {/* Capabilities */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 max-w-3xl">
        <p>Multi-platform publishing</p>
        <p>Scheduled post management</p>
        <p>Performance analytics</p>
        <p>Unified inbox</p>
        <p>Brand asset library</p>
        <p>AI-assisted content</p>
      </section>

      {/* Pricing */}
      <Pricing />

      {/* Final CTA */}
      <section className="mt-32">
        <p className="text-xl text-slate-300 mb-6">
          Manage social operations with precision.
        </p>
        <button
          onClick={() => navigate(createPageUrl("Signin"))}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
        >
          Get Early Access
        </button>
      </section>

      <Footer />
    </main>
  );
}
