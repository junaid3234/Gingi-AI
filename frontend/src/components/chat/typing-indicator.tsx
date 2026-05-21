"use client";

import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2.5"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand shadow-sm">
        <Stethoscope className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-[var(--border)] bg-[var(--muted)] px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--primary)]"
            animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </div>
    </motion.div>
  );
}
