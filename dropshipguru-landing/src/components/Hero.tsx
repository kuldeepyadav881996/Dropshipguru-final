"use client";

import { Rocket, Phone, Shield } from "lucide-react";
import DashboardMockup from "./DashboardMockup";

const TRUST_BADGES = [
  { emoji: "👥", label: "5000+ Students" },
  { emoji: "⭐", label: "4.9/5 Rating" },
  { emoji: "🎧", label: "Lifetime Support" },
  { emoji: "📦", label: "No Inventory Required" },
];

const STATS = [
  { icon: "🏪", value: "2,500+", label: "Stores Launched" },
  { icon: "💰", value: "₹3 Cr+", label: "Sales Generated" },
  { icon: "🎧", value: "24/7", label: "Expert Support" },
  { icon: "⭐", value: "4.9/5", label: "Customer Rating" },
];

export default function Hero() {
  return (
    <section className="relative z-10 overflow-hidden px-4 pb-16 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-6">
          {/* Trust pill */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-card-dark/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <Shield size={14} className="text-gold" />
            Trusted Ecommerce Partner · India
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
            <span className="block text-white">Launch &amp; Scale Your</span>
            <span className="block gold-gradient-text">Dropshipping Business</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg font-semibold text-white sm:text-xl">
            Done-for-you store setup, operations &amp; growth — built for serious
            sellers.
          </p>

          {/* Body */}
          <p className="max-w-xl text-base leading-relaxed text-body-text">
            We handle marketplace listings, supplier coordination, payments and
            fulfillment so you can focus on revenue — not technical setup.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#get-started"
              className="inline-flex items-center gap-2 rounded-full gold-gradient px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              <Rocket size={16} />
              Start Selling Today
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-card-dark/60 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-gold hover:bg-card-dark"
            >
              <Phone size={16} className="text-gold" />
              Call Now
            </a>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap items-center gap-y-2 text-xs text-body-text sm:text-sm">
            {TRUST_BADGES.map((badge, i) => (
              <span key={badge.label} className="inline-flex items-center">
                {i > 0 && (
                  <span className="mx-3 hidden h-4 w-px bg-white/10 sm:inline-block" />
                )}
                <span className="mr-1.5">{badge.emoji}</span>
                <span className="text-white/80">{badge.label}</span>
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="glass-card grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-1 bg-card-dark/80 px-4 py-5 text-center"
              >
                <span className="text-lg">{stat.icon}</span>
                <span className="font-display text-xl font-bold text-white">
                  {stat.value}
                </span>
                <span className="text-[11px] text-body-text">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="relative lg:pl-4">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
