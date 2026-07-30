"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PaperclipIcon, ArrowUpIcon } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCaseWithMessage } from "../../actions";

type License = { id: string; key: string; domain: string | null; tier: string };
type Path = "aether" | "general";
// "choose": the two entry buttons. "aether-license": Aether path's follow-up
// dropdown. "composer": either path's actual message box.
type Stage = "choose" | "aether-license" | "composer";

function AgentDots() {
  return (
    // 3x3 dot grid, each dot pulsing on its own staggered delay — reads as an
    // active/"thinking" mark rather than a static logo, literal to "Inertia"
    // only in the sense that nothing here sits still.
    <svg aria-hidden viewBox="0 0 30 30" className="h-5 w-5 shrink-0">
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={5 + col * 10}
            cy={5 + row * 10}
            r="2.4"
            className="fill-foreground animate-pulse"
            style={{ animationDelay: `${(row * 3 + col) * 120}ms`, animationDuration: "1.8s" }}
          />
        ))
      )}
    </svg>
  );
}

// The opening agent message — dots + name on their own row, body text below.
// Only shown once, up top; every reply after that is plain text (see
// AgentReply) so the conversation doesn't re-announce "Inertia Agent" on
// every turn.
function AgentIntro({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-1 flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <AgentDots />
        <span className="text-[18px] font-medium tracking-tight">Inertia Agent</span>
      </div>
      <p className="text-[17px] leading-normal sm:leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

// Types `text` out character by character on mount. Steps on a timer rather
// than per-frame so the pace stays the same regardless of refresh rate, and
// honours prefers-reduced-motion by landing on the full string immediately.
function useTypewriter(text: string, speed = 16) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      doneRef.current = true;
      return;
    }
    setShown("");
    doneRef.current = false;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        doneRef.current = true;
      }
    }, speed);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return { shown, done: shown.length >= text.length && text.length > 0 };
}

// A follow-up agent reply — just the response text, no repeated header —
// typed out on mount rather than appearing instantly, so each new turn of
// the guided flow reads as the agent actively responding.
function AgentReply({ children }: { children: string }) {
  const { shown, done } = useTypewriter(children);
  return (
    <p className="px-1 text-[17px] leading-normal sm:leading-relaxed text-muted-foreground">
      {shown}
      {!done && (
        <span
          aria-hidden
          className="inline-block w-[2px] h-[1em] align-text-bottom ml-0.5"
          style={{ background: "currentColor", opacity: 0.6 }}
        />
      )}
    </p>
  );
}

// Shown once the client sends their message and the case/auto-reply are
// being created (a real Claude call now, so this can take a couple seconds)
// — a shimmering "Thinking..." label so the wait doesn't read as the page
// having stalled.
function AgentThinking() {
  return (
    <p
      className="px-1 text-[17px] leading-normal sm:leading-relaxed"
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--sh-muted-foreground) 0%, var(--sh-muted-foreground) 20%, var(--sh-foreground) 50%, var(--sh-muted-foreground) 80%, var(--sh-muted-foreground) 100%)",
        backgroundSize: "220% auto",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
        animation: "placeholder-shimmer 2.2s ease-in-out infinite",
      }}
    >
      Thinking&hellip;
    </p>
  );
}

export function NewCaseView({ clientName, clientAvatarUrl, licenses }: {
  clientName: string;
  clientAvatarUrl: string | null;
  licenses: License[];
}) {
  const { trigger } = useWebHaptics();
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("choose");
  const [path, setPath] = useState<Path | null>(null);
  const [licenseId, setLicenseId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const selectedLicense = licenses.find(l => l.id === licenseId) ?? null;

  const choosePath = (next: Path) => {
    trigger("light");
    setPath(next);
    setStage(next === "aether" ? "aether-license" : "composer");
  };

  const confirmLicense = (id: string) => {
    trigger("light");
    setLicenseId(id);
    setStage("composer");
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    trigger("light");
    setSending(true);
    // The selected license (when the Aether path was taken) is folded into
    // the opening message itself — there's no separate structured field for
    // it on cases/messages yet, and prepending it keeps the case's first
    // message self-describing for whoever picks it up.
    const tag = selectedLicense ? `[Aether license: ${selectedLicense.key}]\n\n` : "";
    const result = await createCaseWithMessage(`${tag}${body}`);
    if (result.success && result.caseId) {
      router.push(`/dashboard/messages/${result.caseId}`);
      return;
    }
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const composerPlaceholder = path === "aether"
    ? "Describe the issue with your theme..."
    : "Describe what's going on...";

  return (
    <div className="flex flex-col gap-0 min-h-[calc(100vh-56px-7rem)] md:min-h-[calc(100vh-56px-2rem)] lg:min-h-[calc(100vh-56px-3rem)]">
      <div className="flex-1" />

      <div className="shrink-0 flex flex-col gap-4 pt-2 pb-4 w-full lg:max-w-[55%] mx-auto">
        <AgentIntro>
          Hello, I&rsquo;m an AI assistant from Inertia. If we find something I can&rsquo;t solve, I&rsquo;ll help create a support case for you.
        </AgentIntro>

        {stage === "choose" && (
          <div className="px-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => choosePath("aether")}
              className="rounded-full border bg-sidebar px-4 py-2 text-[14px] font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
            >
              Aether support
            </button>
            <button
              type="button"
              onClick={() => choosePath("general")}
              className="rounded-full border bg-sidebar px-4 py-2 text-[14px] font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
            >
              General support
            </button>
          </div>
        )}

        {stage === "aether-license" && (
          <>
            <AgentReply>
              Thank you. Can you also let me know which license you&rsquo;re inquiring about?
            </AgentReply>
            <div className="px-1">
              <Select onValueChange={(value) => value && confirmLicense(value as string)}>
                <SelectTrigger className="w-full sm:w-72">
                  <SelectValue placeholder="Select a license" />
                </SelectTrigger>
                <SelectContent>
                  {licenses.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">No licenses found</div>
                  ) : (
                    licenses.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.key}{l.domain ? ` — ${l.domain}` : ""}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {path === "general" && stage === "composer" && (
          <AgentReply>
            Go ahead and describe your issue and I&rsquo;ll do my best to resolve it here and now — if I can&rsquo;t, I&rsquo;ll open up a support case for Inertia to review.
          </AgentReply>
        )}
        {path === "aether" && stage === "composer" && selectedLicense && (
          <AgentReply>
            {`Got it — ${selectedLicense.key}. Now go ahead and describe the issue you’re running into.`}
          </AgentReply>
        )}

        {/* Composer stays visible from the start rather than appearing only
            once a path is picked — the buttons/dropdown above it are just
            the agent's guided flow, not a gate on typing a message. */}
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className="flex flex-col gap-2.5 px-3 py-3 rounded-2xl border bg-muted/30 focus-within:border-ring transition-colors"
          style={{ minHeight: 180, "--sh-ring": "var(--sh-muted-foreground)" } as React.CSSProperties}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-background pl-1 pr-3.5 py-1">
            <Avatar className="h-6 w-6 shrink-0">
              {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
              <AvatarFallback>{clientName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium tracking-tight">{clientName}</span>
          </div>
          <textarea
            rows={1}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={composerPlaceholder}
            autoFocus
            className="w-full resize-none tracking-tight placeholder:text-muted-foreground focus:outline-none leading-relaxed bg-transparent"
            style={{ maxHeight: 100, overflowY: "auto", fontSize: 16 }}
          />
          <div className="flex items-center justify-between mt-auto">
            {/* Attachments aren't wired up yet — no upload/storage path exists
                for case messages. Placeholder so the composer reads complete;
                swap for a real file picker once that's built. */}
            <button
              type="button"
              disabled
              title="Attachments coming soon"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground opacity-40 cursor-not-allowed"
            >
              <PaperclipIcon className="size-4" />
            </button>
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-foreground transition-opacity hover:bg-sidebar-accent/40 disabled:opacity-40 disabled:hover:bg-background"
            >
              <ArrowUpIcon className="size-4" />
            </button>
          </div>
        </form>

        {sending && <AgentThinking />}
      </div>
    </div>
  );
}
