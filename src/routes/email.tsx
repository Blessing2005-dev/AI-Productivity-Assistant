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
import { generateEmail } from "@/lib/ai.functions";
import { useSettings, type AppSettings } from "@/lib/useLocalStorage";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — WorkFlow AI" },
      { name: "description", content: "Generate an editable professional email from a recipient, purpose, key points, tone and length." },
      { property: "og:title", content: "Smart Email Generator — WorkFlow AI" },
      { property: "og:description", content: "Draft workplace emails with AI, then edit and copy them." },
    ],
  }),
  component: EmailPage,
});

const TONES: AppSettings["defaultTone"][] = ["Professional", "Formal", "Friendly", "Persuasive", "Apologetic"];
const LENGTHS = ["Short", "Medium", "Detailed"] as const;

function EmailPage() {
  const { value: settings, loaded } = useSettings();
  const call = useServerFn(generateEmail);

  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState<AppSettings["defaultTone"]>("Professional");
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Apply the default tone chosen in Settings once it has loaded.
  useEffect(() => {
    if (loaded) setTone(settings.defaultTone);
  }, [loaded, settings.defaultTone]);

  async function run() {
    if (!purpose.trim()) {
      toast.error("Please describe the purpose of the email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await call({ data: { recipient, purpose, keyPoints, tone, length } });
      setResult(res.text);
      toast.success("Email drafted. Review it before sending.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setRecipient("");
    setPurpose("");
    setKeyPoints("");
    setResult("");
    setError(null);
  }

  return (
    <AppLayout
      title="Smart Email Generator"
      description="Give the AI the details of your email. It writes a draft using only what you provide — always read and edit it before sending."
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
            <Label htmlFor="recipient">Recipient</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="e.g. my manager, the client team"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose *</Label>
            <Textarea
              id="purpose"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. request an extension on the monthly report"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Key points</Label>
            <Textarea
              id="points"
              rows={5}
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              placeholder="One point per line. Only facts you provide will be used."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value as AppSettings["defaultTone"])}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {TONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <select
                id="length"
                value={length}
                onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {LENGTHS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </Button>
            <Button type="button" variant="secondary" disabled={loading || !result} onClick={() => void run()}>
              Regenerate
            </Button>
            <Button type="button" variant="ghost" onClick={clear}>
              Clear
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Draft email (editable)</h2>
            <CopyButton text={result} />
          </div>
          <AiOutput
            loading={loading}
            error={error}
            text={result}
            editable
            onTextChange={setResult}
            emptyHint="Your generated email will appear here. Fill in the form and press Generate."
            loadingHint="Writing your email…"
          />
          <p className="text-xs text-muted-foreground">
            AI-generated. Check names, dates and commitments before sending.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
