import { AlertCircle, Copy, Inbox, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * Shared panel that renders the four states every AI feature needs:
 * loading, error, empty, and a result. Keeping this in one place means each
 * feature page stays short and behaves the same way.
 */
export function AiOutput({
  loading,
  error,
  text,
  emptyHint,
  loadingHint = "Generating with AI…",
  editable,
  onTextChange,
}: {
  loading: boolean;
  error: string | null;
  text: string;
  emptyHint: string;
  loadingHint?: string;
  editable?: boolean;
  onTextChange?: (value: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-muted-foreground">{loadingHint}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center"
      >
        <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
        <p className="text-sm font-medium text-destructive">{error}</p>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card p-8 text-center">
        <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
        <p className="max-w-sm text-sm text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  if (editable) {
    return (
      <textarea
        value={text}
        onChange={(e) => onTextChange?.(e.target.value)}
        className="min-h-96 w-full resize-y rounded-xl border bg-card p-4 font-sans text-sm leading-relaxed text-card-foreground outline-none focus:ring-2 focus:ring-ring"
        aria-label="AI generated result (editable)"
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 text-sm leading-relaxed text-card-foreground">
      <FormattedText text={text} />
    </div>
  );
}

/** Very small markdown-style renderer: headings, bullets and paragraphs. */
export function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith("## ") || trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="pt-3 text-base font-semibold text-primary">
              {trimmed.replace(/^#+\s*/, "")}
            </h3>
          );
        }
        if (/^[-*]\s+/.test(trimmed)) {
          return (
            <p key={i} className="flex gap-2 pl-1">
              <span className="text-accent" aria-hidden>
                •
              </span>
              <span>{stripBold(trimmed.replace(/^[-*]\s+/, ""))}</span>
            </p>
          );
        }
        return <p key={i}>{stripBold(trimmed)}</p>;
      })}
    </div>
  );
}

function stripBold(value: string) {
  return value.replace(/\*\*/g, "");
}

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={!text}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        } catch {
          toast.error("Could not copy. Please select the text and copy manually.");
        }
      }}
    >
      <Copy className="mr-2 h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
