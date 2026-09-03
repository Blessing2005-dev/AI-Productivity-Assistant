import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { Loader2, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { FormattedText } from "@/components/AiOutput";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Workplace Chatbot — WorkFlow AI" },
      { name: "description", content: "Chat with an AI assistant about workplace communication, task organisation, meeting preparation and productivity." },
      { property: "og:title", content: "AI Workplace Chatbot — WorkFlow AI" },
      { property: "og:description", content: "A workplace productivity chatbot that asks instead of guessing." },
    ],
  }),
  component: ChatPage,
});

const SUGGESTIONS = [
  "How do I politely follow up on an unanswered email?",
  "Help me prepare an agenda for a 30 minute team meeting.",
  "How should I plan a week with three competing deadlines?",
  "Give me a simple way to run a weekly review of my work.",
];

function ChatPage() {
  // One conversation, kept in memory for this browser session only.
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onError: (e) => toast.error(e.message || "The chatbot could not respond. Please try again."),
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (!busy) inputRef.current?.focus();
  }, [busy]);

  function send(text: string) {
    const value = text.trim();
    if (!value || busy) return;
    void sendMessage({ text: value });
    setInput("");
  }

  return (
    <AppLayout
      title="AI Workplace Chatbot"
      description="Ask about workplace communication, task organisation, meeting preparation and productivity. The chatbot has no access to your files, email or calendar."
    >
      <div className="flex h-[70vh] flex-col rounded-xl border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 && (
            <div className="mx-auto max-w-lg py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No messages yet. Try one of these to get started:
              </p>
              <div className="mt-4 grid gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-lg border px-3 py-2 text-left text-sm hover:border-primary/50 hover:bg-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => {
            const text = message.parts
              .map((part) => (part.type === "text" ? part.text : ""))
              .join("");
            const isUser = message.role === "user";
            return (
              <div key={message.id} className={isUser ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm text-primary-foreground"
                      : "max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-3 text-sm text-secondary-foreground"
                  }
                >
                  {isUser ? text : <FormattedText text={text} />}
                </div>
              </div>
            );
          })}

          {status === "submitted" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> WorkFlow AI is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          className="flex items-end gap-2 border-t p-4"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            rows={2}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask a workplace productivity question…"
            aria-label="Message"
            className="min-h-[52px] flex-1 resize-y rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            <Send className="mr-2 h-4 w-4" aria-hidden />
            Send
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setMessages([]);
              toast.success("Conversation cleared.");
            }}
          >
            Clear
          </Button>
        </form>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        AI-generated responses may be wrong. Do not share confidential information in this chat.
      </p>
    </AppLayout>
  );
}
