"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronRight, Send, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";

const SECTION_LABELS: Record<string, string> = {
  A: "Basic Information",
  B: "Oral Hygiene",
  C: "Gingival Symptoms",
  D: "Clinical Assessment",
};

const SECTION_COLORS: Record<string, string> = {
  A: "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800 dark:text-sky-400",
  B: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400",
  C: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400",
  D: "bg-violet-500/10 text-violet-600 border-violet-200 dark:border-violet-800 dark:text-violet-400",
};

const TOTAL_QUESTIONS = 27;

export function ChatInterface() {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionKey, setQuestionKey] = useState<string | null>(null);
  const [options, setOptions] = useState<string[] | null>(null);
  const [inputType, setInputType] = useState<"choice" | "number" | "text">("choice");
  const [progress, setProgress] = useState(0);
  const [section, setSection] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [textInput, setTextInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  // Extract the actual question from the message (last line after intro text)
  const extractQuestion = (content: string) => {
    const lines = content.split("\n").filter((l) => l.trim());
    return lines[lines.length - 1] || content;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.startChat();
        if (cancelled) return;
        setSessionId(res.session_id);
        setQuestionKey(res.question_key);
        setOptions(res.options);
        setInputType(res.input_type as "choice" | "number" | "text");
        setProgress(res.progress);
        setSection(res.section);
        setCurrentQuestion(extractQuestion(res.message.content));
        setQuestionNumber(1);
        setMessages([{ id: "1", role: "assistant", content: res.message.content, timestamp: new Date() }]);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to connect to backend");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submitAnswer = async (answer: string) => {
    if (!sessionId || !questionKey || !answer.trim() || submitting) return;
    setError(null);
    setSubmitting(true);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: answer, timestamp: new Date() }]);
    setTextInput("");
    setTyping(true);

    try {
      await new Promise((r) => setTimeout(r, 400));
      const res = await api.answerChat(sessionId, questionKey, answer.trim());
      setTyping(false);
      setProgress(res.progress);
      if (res.section) setSection(res.section);

      if (res.completed) {
        if (res.message) {
          setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: res.message!.content, timestamp: new Date() }]);
          setCurrentQuestion("Analyzing your responses…");
        }
        setOptions(null);
        const pred = await api.predict(sessionId);
        sessionStorage.setItem(`gingiai-result-${sessionId}`, JSON.stringify(pred));
        router.push(`/results/${sessionId}`);
        return;
      }

      if (res.message) {
        setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", content: res.message!.content, timestamp: new Date() }]);
        setCurrentQuestion(extractQuestion(res.message.content));
      }
      setQuestionKey(res.question_key);
      setOptions(res.options);
      setInputType(res.input_type as "choice" | "number" | "text");
      setQuestionNumber((n) => Math.min(n + 1, TOTAL_QUESTIONS));
    } catch (e) {
      setTyping(false);
      setError(e instanceof Error ? e.message : "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-[var(--primary)] opacity-20" />
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-[var(--foreground)]">Starting your screening</p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">Connecting to Gingi assistant…</p>
        </div>
      </div>
    );
  }

  // ── Error (no session) ───────────────────────────────────────────────────
  if (error && !sessionId) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          <AlertCircle className="h-7 w-7 text-rose-500" />
        </div>
        <h2 className="text-lg font-bold text-[var(--foreground)]">Cannot connect to backend</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">{error}</p>
        <p className="mt-4 rounded-xl bg-[var(--muted)] px-4 py-3 text-left font-mono text-xs text-[var(--muted-foreground)]">
          cd backend && uvicorn app.main:app --reload
        </p>
      </div>
    );
  }

  const sectionColor = section ? SECTION_COLORS[section] ?? SECTION_COLORS.A : SECTION_COLORS.A;

  // ── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-0 px-4 pb-8 pt-4 lg:flex-row lg:items-start lg:gap-5">

      {/* ── Sidebar ── */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 space-y-4">
          {/* Gingi card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand shadow-md">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">Gingi</p>
                <p className="text-xs text-[var(--muted-foreground)]">AI Dental Assistant</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">Progress</span>
                <span className="text-xs font-bold text-[var(--primary)]">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-[var(--muted-foreground)]">
                Question {questionNumber} of {TOTAL_QUESTIONS}
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Sections</p>
            <div className="space-y-1.5">
              {Object.entries(SECTION_LABELS).map(([key, label]) => {
                const isActive = section === key;
                const isDone = section && section > key;
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--primary)] text-white"
                        : isDone
                        ? "text-[var(--muted-foreground)] line-through opacity-60"
                        : "text-[var(--muted-foreground)]"
                    }`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isActive ? "bg-white/20" : "bg-[var(--muted)]"}`}>
                      {key}
                    </span>
                    {label}
                    {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            For educational use only. Not a medical diagnosis.
          </p>
        </div>
      </aside>

      {/* ── Chat panel ── */}
      <div className="flex min-w-0 flex-1 flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg overflow-hidden"
           style={{ height: "calc(100vh - 7rem)", minHeight: 560 }}>

        {/* Header */}
        <div className="shrink-0 border-b border-[var(--border)] bg-[var(--card)] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand shadow-sm">
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--foreground)]">Gingi Screening</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {section ? `Section ${section} · ${SECTION_LABELS[section]}` : "Starting…"}
                </p>
              </div>
            </div>
            {/* Mobile progress */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-24">
                <Progress value={progress} className="h-1.5" />
              </div>
              <span className="text-xs font-bold text-[var(--primary)]">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Active question banner */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 border-b border-[var(--border)] px-5 py-4"
            style={{ background: "color-mix(in srgb, var(--primary) 5%, var(--card))" }}
          >
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${sectionColor}`}>
                {section ? SECTION_LABELS[section] : "Question"}
              </span>
              <p className="text-sm font-semibold leading-snug text-[var(--foreground)] sm:text-base">
                {currentQuestion}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Messages — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-3">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Answer area */}
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--card)] px-5 py-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-600 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-400"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {options && options.length > 0 ? (
            <div className={`grid gap-2 ${options.length <= 2 ? "grid-cols-2" : options.length <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
              {options.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => submitAnswer(opt)}
                  disabled={submitting}
                  className="rounded-xl border-2 border-[var(--border)] bg-[var(--answer-bg)] px-4 py-3 text-left text-sm font-medium text-[var(--foreground)] transition-all duration-150 hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,var(--card))] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1"
                >
                  {opt}
                </motion.button>
              ))}
            </div>
          ) : (
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); submitAnswer(textInput); }}
            >
              <input
                ref={inputRef}
                type={inputType === "number" ? "number" : "text"}
                min={inputType === "number" ? 1 : undefined}
                max={inputType === "number" ? 120 : undefined}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={inputType === "number" ? "Enter your age (e.g. 25)" : "Type your answer…"}
                className="screening-input flex-1"
                autoFocus
                disabled={submitting}
              />
              <Button
                type="submit"
                disabled={submitting || !textInput.trim()}
                className="shrink-0 gap-2"
              >
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
