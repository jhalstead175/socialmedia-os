import React from 'react';

export function TrustBadgesRow({
  headline = "Trusted to help you win offers",
  badges = [
    { label: "ATS‑Optimized", icon: "⚡" },
    { label: "AI Precision", icon: "🤖" },
    { label: "Executive & Legal Templates", icon: "📄" },
    { label: "Interview Drills", icon: "🎯" },
    { label: "Privacy‑First", icon: "🔒" },
  ],
  className = "",
}) {
  return (
    <section className={`mx-auto max-w-7xl px-6 md:px-8 py-10 ${className}`} aria-label="Trust badges">
      <div className="flex flex-col items-center gap-6">
        <p className="text-sm text-zinc-400">{headline}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-700/70 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-300"
            >
              <span aria-hidden>{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustBadgesRow;