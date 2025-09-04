import React, { useState, useEffect } from 'react';

export function PricingPlansV2({
  cycle,
  defaultCycle = "annual",
  onSelect = (plan) => {},
  onCycleChange,
}) {
  const [internal, setInternal] = useState(defaultCycle);
  const current = cycle ?? internal;

  useEffect(() => {
    onCycleChange && onCycleChange(current);
  }, [current, onCycleChange]);

  const price = {
    starter: "$0",
    pro: current === "annual" ? "$144/yr" : "$16/mo",
    elite: current === "annual" ? "$468/yr" : "$49/mo",
  };

  const setCycle = (c) => {
    setInternal(c);
    onCycleChange && onCycleChange(c);
  };

  const Box = ({
    tier,
    title,
    features,
    highlight = false,
  }) => (
    <div className={`relative rounded-3xl border ${
      highlight ? "border-indigo-500/60 shadow-[0_0_0_1px_rgba(99,102,241,.25),0_20px_50px_-20px_rgba(0,0,0,.7)]" : "border-zinc-800"
    } bg-zinc-950/40 p-6 md:p-7`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">Most Popular</span>
        </div>
      )}
      <div className="mt-1">
        <h3 className="text-xl font-semibold text-zinc-100">{title}</h3>
        <div className="mt-2 text-3xl font-bold tracking-tight text-zinc-100">{price[tier]}</div>
        <p className="mt-1 text-xs text-zinc-400">{current === "annual" ? "Billed annually" : "Billed monthly"}</p>
      </div>
      <ul className="mt-5 space-y-2 text-sm text-zinc-300">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-400" />
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(tier)}
        className={`mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus-visible:ring-2 ${
          highlight
            ? "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-400"
            : "border border-zinc-700/80 text-zinc-200 hover:bg-zinc-900"
        }`}
        aria-label={`Choose ${title} plan`}
      >
        {tier === "starter" ? "Get Started Free" : "Upgrade"}
      </button>
    </div>
  );

  return (
    <section className="mx-auto max-w-7xl px-6 md:px-8 py-16" aria-label="Pricing">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">Simple, Flexible Pricing</h2>
        <p className="mt-2 text-sm md:text-base text-zinc-400">Start free. Upgrade when you're ready. Cancel anytime.</p>

        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-zinc-700/80 bg-zinc-900/40 px-2 py-1 text-xs text-zinc-300" role="tablist" aria-label="Billing cycle">
          <button
            role="tab"
            aria-selected={current === "monthly"}
            aria-controls="pricing-monthly"
            className={`rounded-full px-3 py-1 ${current === "monthly" ? "bg-zinc-800 text-zinc-100" : ""}`}
            onClick={() => setCycle("monthly")}
          >
            Monthly
          </button>
          <button
            role="tab"
            aria-selected={current === "annual"}
            aria-controls="pricing-annual"
            className={`rounded-full px-3 py-1 ${current === "annual" ? "bg-zinc-800 text-zinc-100" : ""}`}
            onClick={() => setCycle("annual")}
          >
            Annual <span className="ml-1 text-emerald-400">Save 25%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        <Box
          tier="starter"
          title="Starter"
          features={["1 active resume", "ATS formatting", "1-click PDF", "10 Q&A/day", "Community tips"]}
        />
        <Box
          tier="pro"
          title="Pro"
          highlight
          features={["Unlimited resumes", "Role-tuned rewrites", "Cover letters", "Drills with feedback", "LinkedIn optimizer", "Priority support"]}
        />
        <Box
          tier="elite"
          title="Elite"
          features={["Executive narrative", "Industry templates", "Panel simulator", "Case-study builder", "Personal brand kit", "White-glove chat"]}
        />
      </div>
    </section>
  );
}

export default PricingPlansV2;