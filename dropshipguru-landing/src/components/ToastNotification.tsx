"use client";

import { motion } from "framer-motion";

export default function ToastNotification() {
  return (
    <motion.div
      className="glass-card fixed bottom-24 left-4 z-50 max-w-xs rounded-xl p-4 shadow-2xl sm:bottom-8 sm:left-8 sm:max-w-sm"
      initial={{ x: -120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 1.5 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
          <img src="/logo.png" alt="DropshipGuru logo" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-sm leading-snug text-white/90">
            <span className="font-semibold text-gold">Priya from Mumbai</span> just
            got their Ecommerce Website built
          </p>
          <p className="mt-1 text-xs text-body-text">5 minutes ago</p>
        </div>
      </div>
    </motion.div>
  );
}
