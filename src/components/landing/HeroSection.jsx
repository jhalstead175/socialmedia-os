import React from 'react';
import { InterviewCoachWidget } from './InterviewCoachWidget';

export default function HeroSection({
  onPrimary = () => {},
  onSecondary = () => {},
}) {
  return (
    <section className="relative mx-auto max-w-7xl px-6 md:px-8 pt-14 md:pt-24 pb-10">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute right-[-10%] top-[-10%] h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-10 md:gap-12">
        {/* Left copy */}
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-zinc-100">
            <span className="block">Land interviews in <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-sky-300 bg-clip-text text-transparent">7 seconds</span></span>
            <span className="mt-2 block text-zinc-300 text-xl md:text-2xl font-normal">— the time recruiters spend scanning your resume.</span>
          </h1>
          <p className="mt-5 text-zinc-400 text-base md:text-lg max-w-xl">
            Rezemai tailors your resume to each role, rewrites bullets with measurable impact, and prepares you with interview drills — so you walk in confident.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={onPrimary}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm md:text-base font-semibold text-white shadow hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Get Started Free
            </button>
            <button
              onClick={onSecondary}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/40 px-5 py-3 text-sm md:text-base font-semibold text-zinc-200 hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              See Features
            </button>
          </div>

          {/* Trust row / logos or badges */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
            <span>Used by 5,000+ job seekers</span>
            <span className="hidden sm:inline" aria-hidden>•</span>
            <span>ATS-optimized templates</span>
            <span className="hidden sm:inline" aria-hidden>•</span>
            <span>Interview drills with feedback</span>
          </div>
        </div>

        {/* Right: Ava widget */}
        <div className="md:justify-self-end w-full max-w-xl">
          <InterviewCoachWidget />
        </div>
      </div>
    </section>
  );
}