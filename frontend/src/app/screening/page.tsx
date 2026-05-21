import { ChatInterface } from "@/components/chat/chat-interface";
import { Stethoscope } from "lucide-react";

export const metadata = {
  title: "Screening | GingiAI",
  description: "AI-assisted gingivitis screening conversation",
};

export default function ScreeningPage() {
  return (
    /* Lock the entire page to viewport height — no page scroll at all */
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--background)]">
      {/* Page header — fixed height */}
      <div className="shrink-0 border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--foreground)]">AI Dental Screening</h1>
            <p className="text-xs text-[var(--muted-foreground)]">
              Answer each question to complete your gingivitis assessment
            </p>
          </div>
        </div>
      </div>

      {/* Chat fills the remaining height exactly */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
