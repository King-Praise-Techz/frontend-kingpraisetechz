"use client";

import { useState } from "react";
import { Check, Zap, Star, Building2, MessageCircle } from "lucide-react";
import GetWebsiteModal from "@/components/GetWebsiteModal"; // adjust path if needed

const plans = [
  {
    icon: Zap,
    title: "Starter",
    subtitle: "Perfect for solo founders",
    price: "₦150,000",
    period: "one-time",
    desc: "A clean, fast website to get your business online quickly.",
    features: [
      "Up to 5 pages",
      "Mobile-responsive design",
      "Basic SEO setup",
      "Contact form integration",
      "SSL certificate",
      "1 month support",
    ],
    cta: "Get Started",
    highlighted: false,
    accent: "var(--text-2)",
    accentDim: "rgba(255,255,255,0.05)",
    accentBorder: "var(--border)",
    ctaClass: "btn-secondary",
  },
  {
    icon: Star,
    title: "Professional",
    subtitle: "Most popular choice",
    price: "₦350,000",
    period: "one-time",
    desc: "Full website with branding, animations, and advanced features.",
    features: [
      "Up to 15 pages",
      "Custom UI/UX design",
      "Advanced SEO & analytics",
      "CMS integration",
      "Custom animations",
      "Payment integration",
      "3 months support",
    ],
    cta: "Start Project",
    highlighted: true,
    accent: "var(--brand)",
    accentDim: "var(--brand-dim)",
    accentBorder: "var(--brand-border)",
    ctaClass: "btn-primary",
  },
  {
    icon: Building2,
    title: "Enterprise",
    subtitle: "For scaling businesses",
    price: "Custom",
    period: "scoped",
    desc: "Advanced, bespoke solutions tailored to complex business needs.",
    features: [
      "Unlimited pages",
      "Full custom development",
      "E-commerce / SaaS builds",
      "API & third-party integrations",
      "Performance optimisation",
      "Dedicated project manager",
      "12 months priority support",
    ],
    cta: "Talk to Us",
    highlighted: false,
    accent: "var(--gold)",
    accentDim: "var(--gold-dim)",
    accentBorder: "var(--gold-border)",
    ctaClass: "btn-gold",
  },
];

export default function Pricing() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <section id="pricing" style={{ background: "var(--surface-1)" }} className="py-28 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-16 text-center">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "var(--gold-dim)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}
            >
              Transparent Pricing
            </span>
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
            >
              Invest in your{" "}
              <span style={{ color: "var(--gold)" }}>online presence</span>
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--text-2)" }}>
              No hidden fees. No surprises. Pick the plan that fits your goals and let's get to work.
            </p>
          </div>

          {/* Negotiable pricing banner */}
          <div
            className="flex items-center gap-4 p-4 rounded-2xl mb-10 max-w-2xl mx-auto"
            style={{
              background: "var(--brand-dim)",
              border: "1px solid var(--brand-border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "var(--brand-dim)", border: "1px solid var(--brand-border)" }}
            >
              <MessageCircle size={16} style={{ color: "var(--brand)" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "var(--text-1)" }}>
                Prices are negotiable
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
                These are starting points — every project is different. Fill in your details and we'll reach out with a tailored quote.
              </p>
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="shrink-0 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-200 whitespace-nowrap"
              style={{
                background: "var(--brand)",
                color: "#fff",
                boxShadow: "0 2px 12px var(--brand-glow)",
              }}
            >
              Contact Us
            </button>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.title}
                  className="relative flex flex-col rounded-2xl p-7 transition-all duration-300"
                  style={{
                    background: plan.highlighted ? "var(--surface-2)" : "var(--bg)",
                    border: `1px solid ${plan.highlighted ? plan.accentBorder : "var(--border)"}`,
                    boxShadow: plan.highlighted
                      ? `0 0 0 1px ${plan.accentBorder}, 0 24px 60px rgba(92,110,248,0.12)`
                      : "none",
                  }}
                >
                  {/* Popular badge */}
                  {plan.highlighted && (
                    <div
                      className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      Most Popular
                    </div>
                  )}

                  {/* Icon + title */}
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: plan.accentDim, border: `1px solid ${plan.accentBorder}` }}
                    >
                      <Icon size={18} style={{ color: plan.accent }} />
                    </div>
                    <div>
                      <p className="font-bold text-base" style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}>
                        {plan.title}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-2)" }}>{plan.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-5" style={{ color: "var(--text-2)" }}>{plan.desc}</p>

                  {/* Price */}
                  <div className="mb-1">
                    <span
                      className="text-4xl font-bold"
                      style={{ fontFamily: "var(--font-display)", color: "var(--text-1)" }}
                    >
                      {plan.price}
                    </span>
                    <span className="text-sm ml-2" style={{ color: "var(--text-3)" }}>
                      {plan.period}
                    </span>
                  </div>

                  {/* Negotiable tag under price */}
                  <p className="text-xs mb-5" style={{ color: "var(--text-3)" }}>
                    Starting price — open to discussion
                  </p>

                  {/* Features */}
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: plan.accent }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA — opens modal */}
                  <button
                    onClick={() => setModalOpen(true)}
                    className={`btn btn-full ${plan.ctaClass}`}
                    style={plan.highlighted ? { boxShadow: "0 4px 20px var(--brand-glow)" } : {}}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <p className="text-center text-sm mt-10" style={{ color: "var(--text-3)" }}>
            All prices are in Naira (NGN). Payments split across milestones.{" "}
            Not sure which plan fits?{" "}
            <button
              onClick={() => setModalOpen(true)}
              style={{ color: "var(--brand)" }}
              className="hover:underline font-medium"
            >
              Tell us about your project
            </button>{" "}
            and we'll figure it out together.
          </p>
        </div>
      </section>

      {/* Modal */}
      <GetWebsiteModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}