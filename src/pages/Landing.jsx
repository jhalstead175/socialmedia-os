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

      {/* What SoshlOps Does */}
      <section className="mt-32 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-6 text-white">
          Social media, run like operations
        </h2>
        <p className="text-xl text-slate-300">
          Publishing, scheduling, engagement, and analytics — controlled, auditable, precise.
        </p>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="mt-32 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-10 text-white">
          v1: Core publishing, done right
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
          <p>✓ LinkedIn publishing</p>
          <p>✓ Scheduled posts</p>
          <p>✓ Publishing calendar</p>
          <p>✓ Organization accounts</p>
          <p className="text-slate-500">Analytics (coming soon)</p>
          <p className="text-slate-500">Multi-platform (coming soon)</p>
        </div>
        <p className="mt-6 text-sm text-slate-400">
          Text-only posts. Additional platforms and features in active development.
        </p>
      </section>

      {/* Who It's For */}
      <section className="mt-32 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-10 text-white">
          Built for serious operators
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>Agencies managing multiple accounts</p>
          <p>Corporate communications teams</p>
          <p>Legal and financial firms</p>
          <p>Executive personal brands</p>
          <p>Political and advocacy organizations</p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-32 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-10 text-white">
          Four steps. No friction
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>1. Connect accounts</p>
          <p>2. Compose and schedule</p>
          <p>3. Monitor performance</p>
          <p>4. Manage engagement</p>
        </div>
      </section>

      {/* Why SoshlOps */}
      <section className="mt-32 max-w-3xl">
        <h2 className="text-3xl font-semibold mb-10 text-white">
          Built for operators, not creators
        </h2>
        <div className="space-y-4 text-slate-300">
          <p>Institutional design</p>
          <p>Audit-friendly workflows</p>
          <p>Multi-account by default</p>
          <p>Assistive AI only</p>
          <p>Professional-grade reliability</p>
        </div>
      </section>

      {/* Pricing */}
      <div id="pricing">
        <Pricing />
      </div>

      {/* Final CTA */}
      <section className="mt-32">
        <h2 className="text-3xl font-semibold mb-6 text-white">
          Run social like operations
        </h2>
        <button
          onClick={() => navigate(createPageUrl("Signin"))}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
        >
          Start with SoshlOps
        </button>
      </section>

      <Footer />
    </main>
  );
}
