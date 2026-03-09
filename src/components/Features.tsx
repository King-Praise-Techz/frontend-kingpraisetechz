"use client";
import { Zap, Globe, Code2, ShieldCheck } from "lucide-react";

const features = [
  { icon: <Zap />, title: "Fast Deployment", desc: "Launch your website in days, not months." },
  { icon: <Globe />, title: "Global Reach", desc: "Make your business visible worldwide." },
  { icon: <Code2 />, title: "Modern Tech Stack", desc: "Built with Next.js, Tailwind, and React." },
  { icon: <ShieldCheck />, title: "Secure & Reliable", desc: "SSL, secure forms, and privacy-first architecture." }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-12 text-blue-500">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((f, i) => (
            <div key={i} className="p-8 border rounded-3xl hover:shadow-xl transition">
              <div className="w-16 h-16 flex items-center justify-center mb-6 text-blue-500">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-500">{f.title}</h3>
              <p className="text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}