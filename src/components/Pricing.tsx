"use client";

const plans = [
  { title: "Starter", price: "₦150,000", desc: "Basic website for small businesses." },
  { title: "Professional", price: "₦350,000", desc: "Full website + branding package." },
  { title: "Enterprise", price: "Custom", desc: "Advanced solutions for growing businesses." }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12 text-blue-500">Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border hover:shadow-xl transition">
              <h3 className="text-2xl font-bold mb-2 text-red-500">{p.title}</h3>
              <p className="text-slate-600 mb-6">{p.desc}</p>
              <div className="text-3xl font-extrabold text-blue-500">{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}