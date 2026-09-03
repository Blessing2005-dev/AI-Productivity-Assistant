import { createFileRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI — WorkFlow AI" },
      { name: "description", content: "How to use WorkFlow AI responsibly: verify output, protect confidential information and keep humans in charge of decisions." },
      { property: "og:title", content: "Responsible AI — WorkFlow AI" },
      { property: "og:description", content: "Limitations and safe-use guidance for the WorkFlow AI assistant." },
    ],
  }),
  component: ResponsibleAi,
});

export const RESPONSIBLE_AI_POINTS = [
  "AI-generated information may contain errors.",
  "Users should verify important information before relying on it.",
  "Users should avoid entering confidential or sensitive information.",
  "AI-generated emails should be reviewed and edited before sending.",
  "AI should support human decision-making rather than replace human judgement.",
  "AI should not fabricate facts, sources, names, dates or decisions — if it does, treat the output as unreliable.",
];

function ResponsibleAi() {
  return (
    <AppLayout
      title="Responsible AI"
      description="How this application should be used, and what it cannot do."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Guidelines</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            {RESPONSIBLE_AI_POINTS.map((point) => (
              <li key={point} className="flex gap-2">
                <span className="text-accent" aria-hidden>
                  •
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Known limitations of this app</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>• The AI cannot browse the internet, so the Research Assistant gives no sources or citations.</li>
            <li>• The AI has no access to your email, calendar, files or company systems.</li>
            <li>• The AI only works with the text you type into the forms.</li>
            <li>• Answers can be out of date or incomplete, and may differ each time you regenerate.</li>
            <li>• Tasks, settings and chat history are stored only in your own browser and are not backed up.</li>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
