export default function Pricing() {
  const plans = [
    {
      name: "Free",
      desc: "1 account, 10 posts/month",
      price: "$0",
      cta: "Start Free"
    },
    {
      name: "Pro",
      desc: "5 accounts, unlimited posts, analytics",
      price: "$79/mo",
      cta: "Get Pro",
      highlighted: true
    },
    {
      name: "Elite",
      desc: "Unlimited accounts, team collaboration",
      price: "$299/mo",
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

            <button
              className={`mt-6 w-full rounded-lg px-4 py-2 text-white transition-colors ${
                plan.highlighted
                  ? "bg-emerald-600 hover:bg-emerald-500"
                  : "border border-slate-700 text-slate-200 hover:bg-slate-800"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
