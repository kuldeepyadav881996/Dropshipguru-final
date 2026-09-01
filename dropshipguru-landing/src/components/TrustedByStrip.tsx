"use client";

import { motion } from "framer-motion";
import { PlatformLogo, type PlatformId } from "./PlatformLogo";

const BRANDS: { platform: PlatformId; display: string }[] = [
  { platform: "meesho", display: "Meesho" },
  { platform: "amazon-in", display: "Amazon" },
  { platform: "flipkart", display: "Flipkart" },
  { platform: "shopify", display: "Shopify" },
];

export default function TrustedByStrip() {
  return (
    <section className="relative z-10 px-4 py-10 lg:px-8">
      <div className="glass-card mx-auto max-w-7xl rounded-2xl px-6 py-8">
        <p className="mb-8 text-center text-sm text-body-text">
          Trusted by <span className="font-semibold text-white">5000+ sellers</span>{" "}
          across India
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {BRANDS.map((brand) => (
            <motion.div
              key={brand.platform}
              className="flex cursor-default flex-col items-center gap-2 transition-opacity hover:opacity-90"
              whileHover={{ scale: 1.05 }}
            >
              <PlatformLogo platform={brand.platform} bare />
              <span className="text-sm font-semibold tracking-tight text-white/40">
                {brand.display}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
