import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Pricing from "@/components/Pricing";
import { getRoleCopy } from "@/lib/role";
import { getHeadline } from "@/lib/analytics";

export default function Landing() {
  const [copy, setCopy] = useState(null);
  const [headline, setHeadline] = useState("");

  useEffect(() => {
    // Get role-based copy
    const roleCopy = getRoleCopy();
    setCopy(roleCopy);

    // Get A/B test headline (overrides role copy)
    const abHeadline = getHeadline();
    setHeadline(abHeadline);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // Show loading state briefly
  if (!copy) {
    return <main className="px-6 max-w-7xl mx-auto"><Header /></main>;
  }

  return (
    <main className="px-6 max-w-7xl mx-auto">
      <Header />

      {/* Hero */}
      <section className="max-w-3xl py-24">
        <h1 className="text-5xl font-semibold tracking-tight">
          {headline}
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          {copy.sub}
        </p>

        <div className="mt-10 flex gap-4">
          <CTA label={copy.primaryCTA} />
          <button
            className="rounded-lg border border-slate-700 px-6 py-3 text-slate-200 hover:bg-slate-800 transition-colors"
            onClick={() => scrollToSection('how-it-works')}
          >
            {copy.secondaryCTA}
          </button>
        </div>
      </section>

      {/* Authority */}
      <section className="border-t border-slate-800 pt-16 text-slate-300">
        Built for professionals who value clarity, credibility, and results.
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-24 max-w-2xl space-y-4 text-slate-300">
        <p>1. Upload your resume</p>
        <p>2. AI optimizes for role, tone, and seniority</p>
        <p>3. Prepare for interviews with confidence</p>
      </section>

      {/* Capabilities */}
      <section className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 max-w-3xl">
        <p>Resume scoring & positioning</p>
        <p>ATS-aligned optimization</p>
        <p>Role & seniority tone control</p>
        <p>Interview preparation</p>
        <p>PDF & DOCX export</p>
        <p>Secure, private processing</p>
      </section>

      {/* Pricing */}
      <Pricing />

      {/* Final CTA */}
      <section className="mt-32">
        <p className="text-xl text-slate-300 mb-6">
          Get interview-ready without the guesswork.
        </p>
        <CTA label={copy.primaryCTA} />
      </section>

      <Footer />
    </main>
  );
}
