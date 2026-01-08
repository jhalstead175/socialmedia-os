import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="py-32 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-24">
        <div className="text-lg font-extrabold tracking-widest text-white">REZEMAI</div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl">
        <h1 className="text-5xl font-semibold tracking-tight">
          Professional Resumes.<br />Interview-Ready.
        </h1>

        <p className="mt-6 text-xl text-slate-300">
          AI-driven resume optimization and interview preparation for serious professionals.
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
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            How It Works
          </button>
        </div>
      </section>

      {/* Authority */}
      <section className="mt-32 border-t border-slate-800 pt-16 text-slate-300">
        Built for professionals who value clarity, credibility, and results.
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mt-24 grid gap-6 max-w-2xl">
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

      {/* Close */}
      <section className="mt-32">
        <p className="text-xl text-slate-300 mb-6">
          Get interview-ready without the guesswork.
        </p>
        <button
          onClick={() => navigate(createPageUrl("Signin"))}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-white hover:bg-emerald-500 transition-colors"
        >
          Get Early Access
        </button>
      </section>
    </main>
  );
}
