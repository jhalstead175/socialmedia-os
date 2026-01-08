export default function Pricing() {
  return (
    <section className="mt-32 max-w-4xl">
      <h2 className="text-3xl font-semibold mb-10 text-white">Pricing</h2>

      <div className="grid md:grid-cols-3 gap-6 text-slate-300">
        {[
          { name: "Free", desc: "Resume score and preview", price: "$0" },
          { name: "Pro", desc: "Full optimization, ATS, exports", price: "$29/mo" },
          { name: "Elite", desc: "Interview coaching, tone control", price: "$79/mo" }
        ].map(p => (
          <div key={p.name} className="border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors">
            <h3 className="text-xl font-medium text-white">{p.name}</h3>
            <p className="mt-2 text-sm">{p.desc}</p>
            <p className="mt-6 text-2xl text-white font-semibold">{p.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
