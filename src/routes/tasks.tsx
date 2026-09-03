import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AiOutput, CopyButton } from "@/components/AiOutput";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { planTasks } from "@/lib/ai.functions";
import { STORAGE_KEYS, useLocalStorage } from "@/lib/useLocalStorage";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — WorkFlow AI" },
      { name: "description", content: "Add tasks with deadlines, durations and priorities, track their status and ask the AI for a suggested order and schedule." },
      { property: "og:title", content: "AI Task Planner — WorkFlow AI" },
      { property: "og:description", content: "Organise your workload by urgency, priority and deadline." },
    ],
  }),
  component: TasksPage,
});

type Priority = "High" | "Medium" | "Low";
type Status = "To Do" | "In Progress" | "Completed";

type Task = {
  id: string;
  name: string;
  deadline: string;
  duration: string;
  priority: Priority;
  notes: string;
  status: Status;
};

const STATUSES: Status[] = ["To Do", "In Progress", "Completed"];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];

const EMPTY = { name: "", deadline: "", duration: "", priority: "Medium" as Priority, notes: "" };

function TasksPage() {
  const { value: tasks, setValue: setTasks } = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const call = useServerFn(planTasks);

  const [draft, setDraft] = useState(EMPTY);
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) {
      toast.error("Give the task a name.");
      return;
    }
    setTasks([...tasks, { ...draft, id: crypto.randomUUID(), status: "To Do" }]);
    setDraft(EMPTY);
    toast.success("Task added.");
  }

  function update(id: string, patch: Partial<Task>) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  async function organise() {
    if (tasks.length === 0) {
      toast.error("Add at least one task first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await call({
        data: {
          tasks: tasks.map(({ name, deadline, duration, priority, notes, status }) => ({
            name,
            deadline,
            duration,
            priority,
            notes,
            status,
          })),
        },
      });
      setPlan(res.text);
      toast.success("Plan created.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The AI request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout
      title="AI Task Planner"
      description="Your tasks are saved in this browser only. The AI organises the tasks you enter — it never adds tasks or deadlines of its own."
    >
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form className="space-y-4 rounded-xl border bg-card p-5" onSubmit={addTask}>
          <h2 className="text-base font-semibold">Add a task</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Task name *</Label>
            <Input id="name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={draft.deadline}
                onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated duration</Label>
              <Input
                id="duration"
                placeholder="e.g. 2 hours"
                value={draft.duration}
                onChange={(e) => setDraft({ ...draft, duration: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <select
              id="priority"
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tnotes">Notes (optional)</Label>
            <Textarea id="tnotes" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
          </div>
          <Button type="submit">Add task</Button>
        </form>

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Your tasks ({tasks.length})</h2>
              <Button type="button" onClick={() => void organise()} disabled={loading || tasks.length === 0}>
                {loading ? "Organising…" : "Organise with AI"}
              </Button>
            </div>

            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
                No tasks yet. Add your first task using the form.
              </p>
            ) : (
              <ul className="space-y-3">
                {tasks.map((task) => (
                  <li key={task.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={task.status === "Completed" ? "font-medium line-through opacity-60" : "font-medium"}>
                          {task.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {task.deadline ? `Due ${task.deadline}` : "No deadline"} ·{" "}
                          {task.duration || "No duration"} · {task.priority} priority
                        </p>
                        {task.notes && <p className="mt-2 text-sm text-muted-foreground">{task.notes}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Status for ${task.name}`}
                          value={task.status}
                          onChange={(e) => update(task.id, { status: e.target.value as Status })}
                          className="h-9 rounded-md border bg-background px-2 text-xs"
                        >
                          {STATUSES.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${task.name}`}
                          onClick={() => setTasks(tasks.filter((t) => t.id !== task.id))}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Suggested plan</h2>
              <CopyButton text={plan} />
            </div>
            <AiOutput
              loading={loading}
              error={error}
              text={plan}
              emptyHint="Press “Organise with AI” to get prioritised tasks, a suggested order and a suggested schedule."
              loadingHint="Working out an order…"
            />
            <p className="text-xs text-muted-foreground">AI-generated suggestion. You decide the final plan.</p>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
