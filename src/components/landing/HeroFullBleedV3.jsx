import React from 'react';
import { InterviewCoachWidget } from './InterviewCoachWidget';

export function HeroFullBleedV3({
  heroImageUrl = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  title = "Your Resume Has 7 Seconds to Impress. Let's Make it Count.",
  subtitle = "Build expert-level resumes tailored to any job description. Get interview-ready with practice sessions and real-time feedback.",
  showAva = false,
  avatarUrl = "/img/ava-bridge.png",
  onPrimary = () => {},
  onSecondary = () => {},
}) {
  return (
    <section className="relative isolate min-h-[68vh] overflow-hidden">
      {/* Full-bleed image */}
      <img src={heroImageUrl} alt="Interview panel" className="absolute inset-0 h-full w-full object-cover" />
      {/* Dark gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D15] via-[#0B0D15]/80 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 md:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Early Access — Join professionals already using Rezemai
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">{title}</h1>
          <p className="mt-4 text-zinc-300 text-base md:text-lg">{subtitle}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button onClick={onPrimary} className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm md:text-base font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              Get Started Free
            </button>
            <button onClick={onSecondary} className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm md:text-base font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              See Features
            </button>
          </div>
        </div>

        {showAva && (
          <div className="mt-8 max-w-xl">
            <InterviewCoachWidget avatarUrl={avatarUrl} />
          </div>
        )}
      </div>
    </section>
  );
}

export default HeroFullBleedV3;