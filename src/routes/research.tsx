import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AiOutput, CopyButton } from "@/components/AiOutput";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runResearch } from "@/lib/ai.functions";
import { useSettings, type AppSettings } from "@/lib/useLocalStorage";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — WorkFlow AI" },
      { name: "description", content: "Get a structured starting point on a work topic: overview, key findings, concepts, insights and further questions." },
      { property: "og:title", content: "AI Research Assistant — WorkFlow AI" },
      { property: "og:description", content: "Background research without fabricated sources or citations." },
    ],
  }),
  component: ResearchPage,
});

const DETAILS: AppSettings["defaultDetail"][] = ["Quick overview", "Detailed", "Executive summary"];

function ResearchPage() {
  const { value: settings, loaded } = useSettings();
  const call = useServerFn(runResearch);

  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [detail, setDetail] = useState<AppSettings["defaultDetail"]>("Quick overview");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) setDetail(settings.defaultDetail);
  }, [loaded, settings.defaultDetail]);

  async function run() {
    if (!topic.trim()) {
      toast.error("Enter a research topic.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await call({ data: { topic, question, detail } });
      setResult(res.text);
      toast.success("Research generated. Please verify it independently.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      title="AI Research Assistant"
      description="A starting point for your own research. The AI does not browse the internet and does not provide sources or citations."
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
            <Label htmlFor="topic">Research topic *</Label>
            <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. hybrid work policies" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="question">Research question</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What makes hybrid meetings effective?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail">Level of detail</Label>
            <select
              id="detail"
              value={detail}
              onChange={(e) => setDetail(e.target.value as AppSettings["defaultDetail"])}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {DETAILS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Researching…" : "Research"}
            </Button>
            <Button type="button" variant="secondary" disabled={loading || !result} onClick={() => void run()}>
              Regenerate
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setTopic("");
                setQuestion("");
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
            <h2 className="text-base font-semibold">Research output</h2>
            <CopyButton text={result} />
          </div>
          <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-xs">
            AI-generated information. It may be incomplete or out of date — verify anything important using trusted sources.
          </div>
          <AiOutput
            loading={loading}
            error={error}
            text={result}
            emptyHint="Overview, key findings, important concepts, insights, recommendations and further questions will appear here."
            loadingHint="Gathering background…"
          />
        </div>
      </div>
    </AppLayout>
  );
}
