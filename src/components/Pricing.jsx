import { useState } from "react";
import { startCheckout, STRIPE_PRICES } from "@/lib/stripe";
import { track } from "@/lib/analytics";

export default function Pricing() {
  const [loading, setLoading] = useState(null);

  const handleCheckout = async (plan, priceId) => {
    if (!priceId || priceId.startsWith("price_")) {
      alert("Stripe not configured. Please set VITE_STRIPE_PRICE_* environment variables.");
      return;
    }

    setLoading(plan);
    track("pricing_cta_click", { plan });

    try {
      await startCheckout(priceId);
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Please try again.");
      setLoading(null);
    }
  };

  const plans = [
    {
      name: "Free",
      desc: "Resume score and preview",
      price: "$0",
      priceId: null,
      cta: "Start Free"
    },
    {
      name: "Pro",
      desc: "Full optimization, ATS, exports",
      price: "$29/mo",
      priceId: STRIPE_PRICES.PRO_MONTHLY,
      cta: "Get Pro",
      highlighted: true
    },
    {
      name: "Elite",
      desc: "Interview coaching, tone control",
      price: "$79/mo",
      priceId: STRIPE_PRICES.ELITE_MONTHLY,
      cta: "Get Elite"
    }
  ];

  return (
    <section className="mt-32 max-w-4xl">
      <h2 className="text-3xl font-semibold mb-10 text-white">Pricing</h2>

      <div className="grid md:grid-cols-3 gap-6 text-slate-300">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`border rounded-xl p-6 transition-colors ${
              plan.highlighted
                ? "border-emerald-600 bg-emerald-950/20"
                : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <h3 className="text-xl font-medium text-white">{plan.name}</h3>
            <p className="mt-2 text-sm">{plan.desc}</p>
            <p className="mt-6 text-2xl text-white font-semibold">{plan.price}</p>

            {plan.priceId ? (
              <button
                onClick={() => handleCheckout(plan.name, plan.priceId)}
                disabled={loading === plan.name}
                className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === plan.name ? "Loading..." : plan.cta}
              </button>
            ) : (
              <button
                className="mt-6 w-full rounded-lg border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800 transition-colors"
              >
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
