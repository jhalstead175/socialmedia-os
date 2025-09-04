import React from 'react';
import { InterviewCoachWidget } from './InterviewCoachWidget';

export function HeroSectionWithAvaV2({
  avatarUrl = "/img/ava-bridge.png",
  heroImageUrl = "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  title = "Your Resume Has 7 Seconds to Impress. Let's Make it Count.",
  subtitle = "REZEMAI | Helps you craft expert-level resumes with AI precision and clarity to land your dream job.",
  showAva = false,
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
            {title}
          </h1>
          <p className="mt-4 text-zinc-400 text-base md:text-lg max-w-xl">{subtitle}</p>

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
        </div>

        {/* Right visual: wide hero image */}
        <div className="relative md:justify-self-end w-full max-w-xl">
          <div className="overflow-hidden rounded-3xl border border-zinc-800/70 bg-zinc-950/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
            <img src={heroImageUrl} alt="Interview panel in a modern office" className="w-full h-full object-cover" />
          </div>
          {showAva && (
            <div className="absolute -bottom-5 left-5 right-auto max-w-[80%]">
              <InterviewCoachWidget avatarUrl={avatarUrl} className="shadow-lg" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroSectionWithAvaV2;