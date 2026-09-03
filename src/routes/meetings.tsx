import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { AiOutput, CopyButton } from "@/components/AiOutput";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summariseNotes } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — WorkFlow AI" },
      { name: "description", content: "Paste raw meeting notes and get a summary, key decisions, action items, deadlines and important points." },
      { property: "og:title", content: "Meeting Notes Summarizer — WorkFlow AI" },
      { property: "og:description", content: "Structure your meeting notes with AI, using only what the notes contain." },
    ],
  }),
  component: MeetingsPage,
});

function MeetingsPage() {
  const call = useServerFn(summariseNotes);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    if (notes.trim().length < 20) {
      toast.error("Please paste at least a few lines of notes.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await call({ data: { notes } });
      setResult(res.text);
      toast.success("Notes summarised.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      title="Meeting Notes Summarizer"
      description="Paste your raw notes. The AI only uses what is written in them — if something is not in the notes, it will say so instead of inventing it."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          className="space-y-4 rounded-xl border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="notes">Meeting notes *</Label>
            <Textarea
              id="notes"
              rows={16}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste the notes exactly as you took them. Avoid confidential details."
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Summarizing…" : "Summarize"}
            </Button>
            <Button type="button" variant="secondary" disabled={loading || !result} onClick={() => void run()}>
              Regenerate
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setNotes("");
                setResult("");
                setError(null);
              }}
            >
              Clear
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Summary</h2>
            <CopyButton text={result} />
          </div>
          <AiOutput
            loading={loading}
            error={error}
            text={result}
            emptyHint="The summary, key decisions, action items, deadlines and important points will appear here."
            loadingHint="Reading your notes…"
          />
          <p className="text-xs text-muted-foreground">AI-generated. Check the action items and deadlines against your notes.</p>
        </div>
      </div>
    </AppLayout>
  );
}
