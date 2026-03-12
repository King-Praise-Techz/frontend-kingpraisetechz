"use client";
import { Zap, Globe, Code2, ShieldCheck, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Zap,
    tag: "Speed",
    title: "Fast Deployment",
    desc: "Your website goes live in days, not months — without sacrificing quality.",
    accent: "var(--brand)",
    accentDim: "rgba(92,110,248,0.12)",
    accentBorder: "rgba(92,110,248,0.22)",
  },
  {
    icon: Globe,
    tag: "Reach",
    title: "Global Visibility",
    desc: "SEO-optimised, lightning-fast builds that get your brand found worldwide.",
    accent: "#34d399",
    accentDim: "rgba(52,211,153,0.10)",
    accentBorder: "rgba(52,211,153,0.22)",
  },
  {
    icon: Code2,
    tag: "Tech",
    title: "Modern Stack",
    desc: "Built on Next.js, Tailwind CSS, and React — performant by default.",
    accent: "#f0a429",
    accentDim: "rgba(240,164,41,0.10)",
    accentBorder: "rgba(240,164,41,0.22)",
  },
  {
    icon: ShieldCheck,
    tag: "Security",
    title: "Secure & Reliable",
    desc: "SSL certificates, secure forms, and privacy-first architecture baked in.",
    accent: "#a78bfa",
    accentDim: "rgba(167,139,250,0.10)",
    accentBorder: "rgba(167,139,250,0.22)",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ background: "var(--bg)" }} className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
            style={{ background: "var(--brand-dim)", color: "var(--brand)", border: "1px solid var(--brand-border)" }}
          >
            What We Offer
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
          >
            Built for results,{" "}
            <span style={{ color: "var(--brand)" }}>not just looks</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
            Every website we build combines craft and engineering to deliver something that actually works for your business.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl transition-all duration-300 cursor-default"
                style={{
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = f.accentBorder;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${f.accentDim}`;
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {/* Bottom accent line */}
                <div
                  className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }}
                />

                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.accentDim, border: `1px solid ${f.accentBorder}` }}
                >
                  <Icon size={20} style={{ color: f.accent }} />
                </div>

                <span
                  className="text-xs font-semibold tracking-wider uppercase mb-2 block"
                  style={{ color: f.accent }}
                >
                  {f.tag}
                </span>

                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                >
                  {f.title}
                </h3>

                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}