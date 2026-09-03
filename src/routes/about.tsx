import { createFileRoute } from "@tanstack/react-router";

import { AppLayout } from "@/components/AppLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — WorkFlow AI by Blessing Lumnka" },
      { name: "description", content: "WorkFlow AI is a student-developed AI productivity application by Blessing Lumnka, designed to assist users with common workplace tasks." },
      { property: "og:title", content: "About — WorkFlow AI by Blessing Lumnka" },
      { property: "og:description", content: "Project information for the student-developed WorkFlow AI assistant." },
    ],
  }),
  component: About,
});

const FEATURE_NOTES = [
  {
    name: "Smart Email Generator",
    inputs: "Recipient, purpose, key points, tone, length.",
    output: "A subject line and email body, editable in the browser.",
    limits: "Uses only the details you type; placeholders such as [add date] are left for anything missing.",
  },
  {
    name: "Meeting Notes Summarizer",
    inputs: "Raw meeting notes pasted by the user.",
    output: "Summary, key decisions, action items, deadlines and important points.",
    limits: "If something is not in the notes it reports “None mentioned in the notes.”",
  },
  {
    name: "AI Task Planner",
    inputs: "Task name, deadline, estimated duration, priority, notes and status.",
    output: "Prioritised tasks, a suggested order and a suggested schedule.",
    limits: "It never adds tasks or deadlines you did not enter. Tasks are stored in your browser.",
  },
  {
    name: "AI Research Assistant",
    inputs: "Topic, research question and level of detail.",
    output: "Overview, key findings, concepts, insights, recommendations and further questions.",
    limits: "No internet access, so no sources or citations. Verify everything independently.",
  },
  {
    name: "AI Workplace Chatbot",
    inputs: "Free-text messages in one conversation.",
    output: "Streamed answers about workplace communication, planning and productivity.",
    limits: "No access to your systems; it asks for clarification instead of guessing.",
  },
];

function About() {
  return (
    <AppLayout title="About this project" description="Project information and a short guide to each feature.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Project information</h2>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="font-medium">Project</dt>
              <dd className="text-muted-foreground">WorkFlow AI</dd>
            </div>
            <div>
              <dt className="font-medium">Developer</dt>
              <dd className="text-muted-foreground">Blessing Lumnka</dd>
            </div>
            <div>
              <dt className="font-medium">Description</dt>
              <dd className="text-muted-foreground">
                WorkFlow AI is a student-developed AI productivity application designed to assist users with common
                workplace tasks.
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">How it works</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>• The interface is built with React and TanStack Start.</li>
            <li>• AI requests are sent from the browser to this app&apos;s own server code, which then calls the AI model.</li>
            <li>• The API key stays on the server and is never included in the front-end code.</li>
            <li>• Every prompt follows the same structure: role, task, context, user information, constraints, output format.</li>
            <li>• Tasks and settings are saved in your browser&apos;s local storage; nothing is stored on a server.</li>
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="text-base font-semibold">Feature guide</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {FEATURE_NOTES.map((f) => (
            <article key={f.name} className="rounded-lg border p-4">
              <h3 className="text-sm font-semibold">{f.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Inputs: </span>
                {f.inputs}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">AI output: </span>
                {f.output}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Limitations: </span>
                {f.limits}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
