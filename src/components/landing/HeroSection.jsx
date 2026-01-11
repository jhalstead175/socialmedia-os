import React from 'react';
import { Share2, Calendar, BarChart3 } from 'lucide-react';

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
            <span className="block">Manage your social presence <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">professionally</span></span>
            <span className="mt-2 block text-zinc-300 text-xl md:text-2xl font-normal">— schedule, publish, and analyze all in one place.</span>
          </h1>
          <p className="mt-5 text-zinc-400 text-base md:text-lg max-w-xl">
            SoshOps streamlines your social media operations with intelligent scheduling, multi-platform publishing, and actionable analytics — so you can focus on creating great content.
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

          {/* Trust row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-zinc-500">
            <span>Multi-platform support</span>
            <span className="hidden sm:inline" aria-hidden>•</span>
            <span>Smart scheduling</span>
            <span className="hidden sm:inline" aria-hidden>•</span>
            <span>Real-time analytics</span>
          </div>
        </div>

        {/* Right visual */}
        <div className="relative">
          <div className="rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-8 shadow-2xl border border-zinc-700">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-400" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">Content Scheduler</div>
                  <div className="text-xs text-zinc-400">Plan posts across platforms</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <Share2 className="w-6 h-6 text-purple-400" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">Multi-Platform Publishing</div>
                  <div className="text-xs text-zinc-400">Post everywhere at once</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="text-sm font-semibold text-zinc-100">Analytics Dashboard</div>
                  <div className="text-xs text-zinc-400">Track engagement & growth</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
