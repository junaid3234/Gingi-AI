"use client";

import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex items-end gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-brand shadow-sm">
          <Stethoscope className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "rounded-br-sm gradient-brand font-medium text-white"
            : "rounded-bl-sm border border-[var(--border)] bg-[var(--muted)] font-medium text-[var(--foreground)]"
        )}
      >
        {content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 && line.trim() ? "mt-1.5" : ""}>
            {line}
          </p>
        ))}
      </div>

      {/* User avatar placeholder */}
      {isUser && (
        <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--muted-foreground)]">
          U
        </div>
      )}
    </motion.div>
  );
}
