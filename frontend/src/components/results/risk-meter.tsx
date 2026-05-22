"use client";

import { motion } from "framer-motion";

const RISK_GRADIENT_COLORS: Record<string, { start: string; end: string }> = {
  low: { start: "#34d399", end: "#2dd4bf" },
  moderate: { start: "#fbbf24", end: "#fb923c" },
  high: { start: "#f97316", end: "#f43f5e" },
  critical: { start: "#e11d48", end: "#b91c1c" },
};

export function RiskMeter({
  riskLevel,
  confidence,
}: {
  riskLevel: string;
  confidence: number;
}) {
  const pct = Math.round(confidence * 100);
  const colors = RISK_GRADIENT_COLORS[riskLevel] || RISK_GRADIENT_COLORS.moderate;
  const gradientId = `riskGradient-${riskLevel}`;

  return (
    <div className="relative mx-auto w-full max-w-xs">
      <svg viewBox="0 0 200 120" className="w-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-sky-100 dark:text-slate-800"
        />
        <motion.path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct / 100 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-2 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-slate-900 dark:text-white"
        >
          {pct}%
        </motion.p>
        <p
          className="text-sm font-medium capitalize"
          style={{
            background: `linear-gradient(to right, ${colors.start}, ${colors.end})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {riskLevel} risk
        </p>
      </div>
    </div>
  );
}

