"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontalIcon, PaperclipIcon, ArrowUpIcon } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { sendClientMessage, markAdminMessagesRead, createFollowUpCase, closeCase } from "../../actions";
import { fmtDate, type Case, type Message } from "../../types";
import { useSetPageCrumb, useSetPageActions } from "../../page-crumb-context";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// Inertia Agent's own badge — square, distinct from the client's circular
// Avatar so the two senders read as visually different kinds of participant
// rather than two people. Sized to match Avatar's own h-8 w-8 footprint. The
// mark itself is the same animated 3x3 dot grid used on the new-case intro
// (each dot pulsing on its own staggered delay), with no background behind
// it — just the dots, sized up to fill the badge's own footprint.
function AgentBadge() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      <svg aria-hidden viewBox="0 0 30 30" className="h-6 w-6">
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
    </span>
  );
}

// Shown briefly after sending, while the message is being saved (and, once
// follow-up AI replies are wired up, while a reply is being generated) — a
// shimmering label so the wait doesn't read as the page having stalled.
function AgentThinking() {
  return (
    <p
      className="px-1 text-[15px]"
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

export function CaseThreadView({ clientId, caseData, messages: initialMessages, clientName, clientAvatarUrl, aiBarredUntil: initialAiBarredUntil }: {
  clientId: string;
  caseData: Case;
  messages: Message[];
  clientName: string;
  clientAvatarUrl: string | null;
  aiBarredUntil: string | null;
}) {
  const { trigger } = useWebHaptics();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const [status, setStatus] = useState(caseData.status);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [closing, setClosing] = useState(false);
  const [aiBarredUntil, setAiBarredUntil] = useState(initialAiBarredUntil);
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markRead = () => {
    setMessages(prev => prev.map(m => m.sender === "admin" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    markAdminMessagesRead(caseData.id);
  };

  // Locks page-level scroll while a case thread is open — the container is
  // meant to fit the viewport exactly (see the dvh calc below) with only the
  // message list scrolling internally, but if it's ever briefly taller than
  // the viewport (font/layout timing, keyboard opening), the page itself
  // would otherwise scroll instead. Restored on unmount for every other page.
  //
  // overflow: hidden alone only blocks wheel/programmatic scroll — mobile
  // Safari/Chrome still let a touch drag rubber-band the page (or the whole
  // viewport shift when the input focuses) since that's a touchmove default
  // action, not governed by CSS overflow. touch-action: none plus a
  // touchmove listener that only lets drags through when they originate
  // inside the message list closes that gap.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const blockOutsideList = (e: TouchEvent) => {
      const list = listRef.current;
      if (list && e.target instanceof Node && list.contains(e.target)) return;
      e.preventDefault();
    };
    document.body.addEventListener("touchmove", blockOutsideList, { passive: false });

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
      document.body.removeEventListener("touchmove", blockOutsideList);
    };
  }, []);

  useEffect(() => {
    if (!clientId) return;
    const supabase = createBrowserClient();
    markRead();

    const channel = supabase
      .channel(`case-messages:${caseData.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `case_id=eq.${caseData.id}` },
        (payload) => {
          const incoming = payload.new as Message;
          setMessages(prev => {
            // Already have this exact row — e.g. sendClientMessage's own
            // return value already appended the admin reply directly, and
            // Realtime is now delivering the same INSERT. Skip it rather
            // than rendering a duplicate.
            if (prev.some(m => m.id === incoming.id)) return prev;
            const idx = prev.findIndex(m => m.id.startsWith("optimistic-") && m.sender === incoming.sender && m.body === incoming.body);
            if (idx !== -1) { const next = [...prev]; next[idx] = incoming; return next; }
            return [...prev, incoming];
          });
          if (incoming.sender === "admin") markRead();
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `case_id=eq.${caseData.id}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.sender === "admin") {
          setAdminTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, caseData.id]);

  useEffect(() => {
    // Scrolls only the message list itself (never scrollIntoView, which can
    // scroll the whole page if the list's height is briefly taller than the
    // viewport on load — landing the page at the bottom instead of the top).
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [messages, adminTyping, sending]);

  const onDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "client" } });
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    trigger("light");
    setSending(true);
    setDraft("");
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      client_id: clientId,
      case_id: caseData.id,
      sender: "client",
      body,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);
    const result = await sendClientMessage(body, caseData.id);
    // Append the reply directly rather than waiting on Realtime to deliver
    // it — the INSERT subscription can occasionally miss or lag an event,
    // which is what made the reply intermittently not show up. The INSERT
    // handler above already dedupes by id, so if Realtime *does* also
    // deliver this same row, it's a no-op rather than a duplicate.
    if (result.success && result.reply) {
      const reply = result.reply;
      setMessages(prev => prev.some(m => m.id === reply.id) ? prev : [...prev, reply]);
    }
    if (result.success && result.aiBarredUntil) setAiBarredUntil(result.aiBarredUntil);
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const fmtMsgTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const isClosed = status === "closed";
  const waitingOnClient = !isClosed && messages.length > 0 && messages[messages.length - 1].sender === "admin";
  const isAiBarred = !!aiBarredUntil && new Date(aiBarredUntil).getTime() > Date.now();
  const aiBarredUntilLabel = aiBarredUntil
    ? new Date(aiBarredUntil).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  const onCreateFollowUp = async () => {
    if (creatingFollowUp) return;
    setCreatingFollowUp(true);
    const result = await createFollowUpCase(caseData.id, caseData.title);
    setCreatingFollowUp(false);
    if (result.success && result.caseId) {
      router.push(`/dashboard/messages/${result.caseId}`);
    }
  };

  const onCloseCase = async () => {
    if (closing) return;
    setClosing(true);
    const result = await closeCase(caseData.id);
    setClosing(false);
    setConfirmingClose(false);
    if (result.success) setStatus("closed");
  };

  // Publishes this page's own header content — case number and the actions
  // menu (plus a "we need your response" badge when relevant) — up into the
  // shared topbar (SiteHeader), instead of rendering a second header row
  // inside the page itself. The case title, "updated X", and severity/status
  // badges are deliberately not surfaced there.
  useSetPageCrumb(`#${caseData.case_number}`);
  useSetPageActions(
    <>
      {waitingOnClient && (
        <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 hidden sm:inline-flex">
          We need your response
        </Badge>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontalIcon />
          <span className="sr-only">Case actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem render={<Link href="/dashboard/messages" />}>
            All cases
          </DropdownMenuItem>
          {!isClosed && (
            <DropdownMenuItem onClick={() => setConfirmingClose(true)}>
              Close case
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <div className="relative flex flex-col gap-0 h-[calc(100dvh-56px-3rem)] md:h-[calc(100dvh-56px-2rem)] lg:h-[calc(100dvh-56px-3rem)]" style={{ minHeight: 400 }}>
      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-6 px-1 py-6 w-full lg:max-w-[55%] mx-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 opacity-60">
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isClient = msg.sender === "client";
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isClient ? "" : "flex-row-reverse"}`}>
              {/* Nudged up slightly so the badge/avatar's own vertical center
                  lines up with the name text's center, not the block's top
                  edge — the name's line-height is much shorter than the
                  32px avatar, so top-aligning both by default reads as the
                  mark sitting a little low relative to the name. */}
              <div className="-mt-1.5">
                {isClient ? (
                  <Avatar className="h-8 w-8 shrink-0">
                    {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
                    <AvatarFallback>{initials(clientName)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <AgentBadge />
                )}
              </div>
              <div className={`flex flex-col gap-1 min-w-0 flex-1 ${isClient ? "items-start" : "items-end"}`}>
                <div className={`flex items-baseline gap-2 ${isClient ? "" : "flex-row-reverse"}`}>
                  <span className="text-[14px] font-semibold tracking-tight">{isClient ? clientName : "Inertia Agent"}</span>
                  <span className="text-xs text-muted-foreground">{fmtMsgTime(msg.created_at)}</span>
                </div>
                {/* Capped width + always-left-aligned text, even for admin's
                    right-positioned messages — right-aligning the text itself
                    (not just the bubble) produces ragged-left line breaks that
                    read poorly once a reply runs more than a line or two,
                    worse on narrow mobile widths. The bubble's position (this
                    column sits on the right via items-end) is what signals
                    sender, not the text alignment inside it — same as how
                    iMessage's own right-side bubbles keep left-aligned text. */}
                <p className="max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed whitespace-pre-wrap text-left">{msg.body}</p>
                {/* The agent's own suggestion to close, attached to the
                    specific reply that made it — reuses the same
                    confirmation dialog as the "⋯" menu's Close case item,
                    so there's one close flow either way it's triggered. */}
                {msg.suggest_close && !isClosed && (
                  <Button variant="outline" size="sm" onClick={() => setConfirmingClose(true)}>
                    Close case
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {adminTyping && (
          <div className="flex gap-3 flex-row-reverse">
            <AgentBadge />
            <div className="flex items-center gap-1 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {/* The client's own message is generating a reply — a distinct
            signal from adminTyping (which reflects the OTHER party's live
            typing broadcast). Rendered as a message row like any other, not
            below the composer, so it reads as part of the conversation. */}
        {sending && (
          <div className="flex gap-3 flex-row-reverse">
            <AgentBadge />
            <div className="flex flex-col gap-1 min-w-0 flex-1 items-end pt-0.5">
              <AgentThinking />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 relative flex flex-col pt-2 w-full lg:max-w-[55%] mx-auto">
        {/* Fades scrolled-past message content out under the input instead
            of it cutting off hard against the input's own background.
            Positioned against the pt-2 content div (not the outer wrapper),
            so it sits flush against the bar/form's own top edge with no gap. */}
        <div className="flex flex-col relative">
        <div className={`pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-background to-transparent ${(isClosed || isAiBarred) ? "" : "rounded-t-2xl"}`} />
        {isClosed && (
          <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
            <span className="text-sm text-muted-foreground">Need further help with this case?</span>
            <Button variant="outline" size="sm" onClick={onCreateFollowUp} disabled={creatingFollowUp}>
              {creatingFollowUp ? "Creating..." : "Create follow-up"}
            </Button>
          </div>
        )}
        {!isClosed && isAiBarred && (
          <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
            <span className="text-sm text-muted-foreground">
              You&rsquo;ve sent quite a few messages, so the AI assistant is resting until{" "}
              <span className="inline-flex items-center rounded-full bg-sidebar border px-2 py-0.5 text-foreground">
                {aiBarredUntilLabel}
              </span>
              . Keep sending messages in the meantime, a real person is on it.
            </span>
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className={`flex flex-col gap-2.5 px-3 py-3 border bg-muted/30 focus-within:border-ring transition-colors ${(isClosed || isAiBarred) ? "rounded-b-xl" : "rounded-2xl"}`}
          style={{ minHeight: 120, "--sh-ring": "var(--sh-muted-foreground)" } as React.CSSProperties}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-background pl-1 pr-3.5 py-1">
            <Avatar className="h-6 w-6 shrink-0">
              {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
              <AvatarFallback>{initials(clientName)}</AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium tracking-tight">{clientName}</span>
          </div>
          <textarea
            rows={1}
            value={draft}
            onChange={onDraftChange}
            onKeyDown={onKeyDown}
            placeholder="Send a message..."
            className="w-full resize-none tracking-tight placeholder:text-muted-foreground focus:outline-none leading-relaxed bg-transparent"
            style={{ maxHeight: 100, overflowY: "auto", fontSize: 16 }}
          />
          <div className="flex items-center justify-between mt-auto">
            {/* Attachments aren't wired up yet — see the matching placeholder
                on /messages/new; swap both for a real file picker together. */}
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
        </div>
      </div>

      <Dialog open={confirmingClose} onOpenChange={setConfirmingClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close this case?</DialogTitle>
            <DialogDescription>
              You can still start a new case for this later if it comes back — closing just marks this one resolved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingClose(false)} disabled={closing}>
              Cancel
            </Button>
            <Button onClick={onCloseCase} disabled={closing}>
              {closing ? "Closing..." : "Close case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
