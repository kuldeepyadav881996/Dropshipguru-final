"use client";

import { motion } from "framer-motion";
import { PlatformLogo } from "./PlatformLogo";

export default function ChatWidget() {
  return (
    <motion.a
      href="#chat"
      className="fixed bottom-6 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 sm:right-8"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, type: "spring", stiffness: 200, damping: 20 }}
    >
      <PlatformLogo platform="whatsapp" bare />
      Chat with us
    </motion.a>
  );
}
