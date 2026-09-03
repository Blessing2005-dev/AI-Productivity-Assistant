import { Link, useRouterState } from "@tanstack/react-router";
import {
  BotMessageSquare,
  Info,
  LayoutDashboard,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Settings,
  ShieldCheck,
  ListChecks,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Every page in the app is reachable from this navigation list. */
export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/meetings", label: "Meeting Summarizer", icon: NotebookPen },
  { to: "/tasks", label: "Task Planner", icon: ListChecks },
  { to: "/research", label: "Research Assistant", icon: Search },
  { to: "/chat", label: "Workplace Chatbot", icon: BotMessageSquare },
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
] as const;

function SidebarLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Main navigation">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="px-3">
      <p className="font-display text-lg font-bold text-sidebar-accent-foreground">WorkFlow AI</p>
      <p className="text-xs text-sidebar-foreground/70">by Blessing Lumnka</p>
    </div>
  );
}

/** Page shell: fixed sidebar on desktop, slide-in drawer on mobile. */
export function AppLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-sidebar py-6 lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Brand />
        <div className="px-3">
          <SidebarLinks />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between bg-sidebar px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col gap-6 bg-sidebar py-6">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="rounded-lg p-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <div className="px-3">
              <SidebarLinks onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}
