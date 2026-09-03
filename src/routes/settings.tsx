import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { RESPONSIBLE_AI_POINTS } from "@/routes/responsible-ai";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { STORAGE_KEYS, useSettings, type AppSettings } from "@/lib/useLocalStorage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WorkFlow AI" },
      { name: "description", content: "Choose your default email tone and research detail level, and clear the data WorkFlow AI stores in this browser." },
      { property: "og:title", content: "Settings — WorkFlow AI" },
      { property: "og:description", content: "Defaults and session data for WorkFlow AI." },
    ],
  }),
  component: SettingsPage,
});

const TONES: AppSettings["defaultTone"][] = ["Professional", "Formal", "Friendly", "Persuasive", "Apologetic"];
const DETAILS: AppSettings["defaultDetail"][] = ["Quick overview", "Detailed", "Executive summary"];

function SettingsPage() {
  const { value: settings, setValue: setSettings } = useSettings();

  function clearSession() {
    Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    toast.success("Session data cleared. Reloading…");
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <AppLayout title="Settings" description="These preferences are saved in your browser only.">
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Defaults</h2>

          <div className="space-y-2">
            <Label htmlFor="tone">Default email tone</Label>
            <select
              id="tone"
              value={settings.defaultTone}
              onChange={(e) => {
                setSettings({ ...settings, defaultTone: e.target.value as AppSettings["defaultTone"] });
                toast.success("Default tone saved.");
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detail">Research response detail</Label>
            <select
              id="detail"
              value={settings.defaultDetail}
              onChange={(e) => {
                setSettings({ ...settings, defaultDetail: e.target.value as AppSettings["defaultDetail"] });
                toast.success("Default detail level saved.");
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              {DETAILS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold">Clear session data</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Removes your saved tasks and preferences from this browser. This cannot be undone.
            </p>
            <Button type="button" variant="destructive" className="mt-3" onClick={clearSession}>
              Clear session data
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5">
          <h2 className="text-base font-semibold">Responsible AI reminder</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {RESPONSIBLE_AI_POINTS.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </section>
      </div>
    </AppLayout>
  );
}
