"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MoreHorizontalIcon, PaperclipIcon, ArrowUpIcon, ChevronDownIcon, ListChecksIcon, HeadsetIcon, UndoIcon } from "lucide-react";
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
import { sendClientMessage, markAdminMessagesRead, createFollowUpCase, closeCase, requestHuman, undoRequestHuman } from "../../actions";
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
// `thinking` swaps the badge's usual gentle opacity pulse for a more
// pronounced "forming" animation (each dot scaling up and settling into
// place, staggered per-dot) — used specifically while a reply is being
// generated, so the badge itself signals active work rather than just
// sitting next to the "Thinking..." shimmer text.
function AgentBadge({ thinking = false }: { thinking?: boolean } = {}) {
  // AgentBadge renders multiple times per page (once per agent message row,
  // plus the typing/thinking indicators), so the gradient id has to be
  // unique per instance — a hardcoded id would work in most browsers but
  // duplicate SVG ids on one page make url(#id) references unreliable.
  const gradientId = useId();
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center">
      <svg aria-hidden viewBox="0 0 30 30" className="h-6 w-6">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={5 + col * 10}
              cy={5 + row * 10}
              r="2.4"
              fill={`url(#${gradientId})`}
              className={thinking ? undefined : "animate-pulse"}
              style={{
                transformOrigin: `${5 + col * 10}px ${5 + row * 10}px`,
                animation: thinking
                  ? `agent-dot-form 1.1s ease-in-out ${(row * 3 + col) * 120}ms infinite`
                  : undefined,
                animationDelay: thinking ? undefined : `${(row * 3 + col) * 120}ms`,
                animationDuration: thinking ? undefined : "1.8s",
              }}
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
      className="text-[15px]"
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

// Types `text` out character by character on mount, same as the opening
// guided flow in new-case-view.tsx. Per-character delay varies (small random
// jitter, longer pause after punctuation and spaces between words) instead
// of a flat interval, which is what reads as fluid/human rather than a
// metronomic scroll. Recursive setTimeout rather than setInterval since the
// delay needs to change every tick. Honours prefers-reduced-motion by
// landing on the full string immediately.
function useTypewriter(text: string, baseSpeed = 26) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setShown(text);
      return;
    }
    setShown("");
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const delayAfter = (char: string) => {
      if (".!?".includes(char)) return baseSpeed * 9;
      if (",;:".includes(char)) return baseSpeed * 5;
      if (char === " ") return baseSpeed * 1.6;
      // +-40% jitter around the base pace so consecutive characters don't
      // land on an obviously even rhythm.
      return baseSpeed * (0.6 + Math.random() * 0.8);
    };

    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) return;
      timeoutId = setTimeout(tick, delayAfter(text[i - 1]));
    };
    timeoutId = setTimeout(tick, delayAfter(""));

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, baseSpeed]);

  return { shown, done: shown.length >= text.length && text.length > 0 };
}

// Mirrors the same constants in app/dashboard/actions.ts, which can't be
// imported directly since that's a "use server" module and this renders on
// the client. Keep both in sync if the marker format ever changes.
const STEPS_OPEN_TAG = "[[STEPS]]";
const STEPS_CLOSE_TAG = "[[/STEPS]]";

// Pulls a single [[STEPS]]...[[/STEPS]] block (added by the agent's system
// prompt for genuine multi-step processes) out of the raw message body, so
// it can render as a collapsible list instead of cluttering the reply with
// every step inline. Anything before/after the block still renders as plain
// text. Falls back to the untouched body when no block is present or the
// tags are malformed, rather than showing raw marker text to the client.
function parseMessageBody(body: string): { lead: string; steps: string[] | null; trail: string } {
  const start = body.indexOf(STEPS_OPEN_TAG);
  const end = body.indexOf(STEPS_CLOSE_TAG);
  if (start === -1 || end === -1 || end < start) return { lead: body, steps: null, trail: "" };

  const lead = body.slice(0, start).trim();
  const stepsBlock = body.slice(start + STEPS_OPEN_TAG.length, end).trim();
  const trail = body.slice(end + STEPS_CLOSE_TAG.length).trim();
  const steps = stepsBlock.split("\n").map(s => s.trim()).filter(Boolean);
  if (steps.length === 0) return { lead: body, steps: null, trail: "" };

  return { lead, steps, trail };
}

// The blinking caret shown at the end of text still being typed out.
function TypingCaret() {
  return (
    <span
      aria-hidden
      className="inline-block w-[2px] h-[1em] align-text-bottom ml-0.5"
      style={{ background: "currentColor", opacity: 0.6 }}
    />
  );
}

// `animate` is only ever true for a reply that just arrived live during this
// session (see newAgentMessageIds below) — messages loaded from history
// render instantly, so opening an old case doesn't re-type the whole thread.
// `onProgress`, if given, fires on every revealed character so the parent
// can keep the list scrolled to the growing text instead of it typing out
// below the visible area once a reply runs longer than a screenful.
function MessageBody({ body, animate, onProgress }: { body: string; animate: boolean; onProgress?: () => void }) {
  const { lead, steps, trail } = parseMessageBody(body);
  const plainTyped = useTypewriter(animate && !steps ? body : "");
  const leadTyped = useTypewriter(animate && steps ? lead : "");

  useEffect(() => {
    if (animate) onProgress?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plainTyped.shown, leadTyped.shown]);

  if (!steps) {
    return (
      <p className="max-w-[92%] sm:max-w-[88%] text-[15px] leading-relaxed whitespace-pre-wrap text-left">
        {animate ? plainTyped.shown : body}
        {animate && !plainTyped.done && <TypingCaret />}
      </p>
    );
  }

  // Steps stay hidden inside the collapsible until the lead sentence
  // finishes typing, so the reveal still reads as one sequential moment
  // rather than the whole message (including a collapsed block) appearing
  // instantly with only the lead text animating on top of it.
  const revealSteps = !animate || leadTyped.done;

  return (
    <div className="max-w-[92%] sm:max-w-[88%] flex flex-col gap-2 text-left">
      {lead && (
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {animate ? leadTyped.shown : lead}
          {animate && !leadTyped.done && <TypingCaret />}
        </p>
      )}
      {revealSteps && (
        <details className="group rounded-lg border bg-sidebar/60" style={animate ? { animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" } : undefined}>
          <summary className="flex items-center gap-2 px-3 py-2 text-[13px] font-medium tracking-tight cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
            <ListChecksIcon className="size-3.5 text-muted-foreground shrink-0" />
            <span className="flex-1">{steps.length} steps</span>
            <ChevronDownIcon className="size-3.5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <ol className="flex flex-col gap-1.5 px-3 pb-3 pt-1 text-[14px] leading-relaxed list-decimal list-inside text-muted-foreground [&>li]:marker:text-foreground/60">
            {steps.map((step, i) => (
              <li key={i} className="text-foreground">{step}</li>
            ))}
          </ol>
        </details>
      )}
      {trail && revealSteps && <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{trail}</p>}
    </div>
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
  const [humanRequested, setHumanRequested] = useState(caseData.human_requested);
  const [requestingHuman, setRequestingHuman] = useState(false);
  // Agent replies that arrived live during this page session, so their text
  // types out on arrival. Messages present in initialMessages (case history
  // loaded on open) are never added here, so reopening a case doesn't
  // re-type the whole thread.
  const [newAgentMessageIds, setNewAgentMessageIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
          if (incoming.sender === "admin") {
            markRead();
            setNewAgentMessageIds(prev => new Set(prev).add(incoming.id));
          }
        })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages", filter: `case_id=eq.${caseData.id}` },
        (payload) => {
          const updated = payload.new as Message;
          setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
        })
      // Picks up human_requested flipping back to false the moment an admin
      // actually replies (see sendAdminMessage), so the input re-enables
      // live instead of the client needing to reload the page to type again.
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "cases", filter: `id=eq.${caseData.id}` },
        (payload) => {
          const updated = payload.new as { human_requested: boolean };
          setHumanRequested(updated.human_requested);
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

  // Called on every character revealed by a typing MessageBody, so a long
  // reply keeps scrolling into view as it types instead of growing below the
  // visible area. Only auto-scrolls when already within ~80px of the
  // bottom, so a client who's scrolled up to reread earlier messages while a
  // reply is streaming in doesn't get yanked back down.
  const keepScrolledDuringType = () => {
    const list = listRef.current;
    if (!list) return;
    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    if (distanceFromBottom < 80) list.scrollTop = list.scrollHeight;
  };

  const onDraftChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "client" } });
    // rows={1} keeps the textarea at a fixed single-line height by default,
    // so wrapped text just scrolls out of view instead of growing the box.
    // Resetting height before reading scrollHeight lets it shrink back down
    // too, not just grow — otherwise deleting text back to one line would
    // leave the box tall. Capped by the maxHeight already set in the
    // element's inline style, past which overflowY: auto takes over.
    const el = e.currentTarget;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending || inputDisabled) return;
    trigger("light");
    setSending(true);
    setDraft("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    // Dismisses the mobile keyboard on send, so the layout (shifted up while
    // the input was focused) drops back to its resting position against the
    // notch instead of staying shifted after the message goes out.
    textareaRef.current?.blur();
    // iOS can leave the page's scroll position slightly offset after the
    // keyboard closes even though 100svh itself never changes — the visible
    // symptom is the gap above the input growing a bit after a focus+send
    // round trip. Forcing scroll back to 0 clears that residual offset.
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
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
      setNewAgentMessageIds(prev => new Set(prev).add(reply.id));
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
  const inputDisabled = isClosed || humanRequested;

  const onRequestHuman = async () => {
    if (requestingHuman || humanRequested) return;
    setRequestingHuman(true);
    const result = await requestHuman(caseData.id);
    setRequestingHuman(false);
    if (result.success) setHumanRequested(true);
  };

  const onUndoHuman = async () => {
    if (requestingHuman || !humanRequested) return;
    setRequestingHuman(true);
    const result = await undoRequestHuman(caseData.id);
    setRequestingHuman(false);
    if (result.success) setHumanRequested(false);
  };

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
    <div className="relative flex flex-col gap-0 h-[calc(100svh-56px-6rem)] md:h-[calc(100svh-56px-2rem)] lg:h-[calc(100svh-56px-3rem)]" style={{ minHeight: 400 }}>
      {/* Mirrors the fade above the input at the bottom of the thread —
          message content scrolling up under the shared top bar fades out
          instead of cutting off hard against it. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background to-transparent" />
      <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-6 px-1 py-6 w-full lg:max-w-[55%] mx-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 opacity-60">
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isClient = msg.sender === "client";
          // Desktop keeps the client on the left, agent on the right (this
          // matches the admin side's own thread, where the roles are
          // swapped, so both sides of the conversation read the same way
          // relative to "the other party"). Mobile instead follows the
          // standard messaging-app convention — your own messages on the
          // right — via max-sm:flex-row-reverse, which only overrides the
          // side, not the reversed vs. not-reversed state itself.
          const sideClass = isClient ? "max-sm:flex-row-reverse" : "flex-row-reverse max-sm:flex-row";
          return (
            <div key={msg.id} className={`flex items-start gap-2 ${sideClass}`}>
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
              <div className={`flex flex-col gap-1 min-w-0 flex-1 ${isClient ? "items-start max-sm:items-end" : "items-end max-sm:items-start"}`}>
                <div className={`flex items-baseline gap-2 ${sideClass}`}>
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
                <MessageBody body={msg.body} animate={newAgentMessageIds.has(msg.id)} onProgress={keepScrolledDuringType} />
                {/* The agent's own suggestion to close, attached to the
                    specific reply that made it — reuses the same
                    confirmation dialog as the "⋯" menu's Close case item,
                    so there's one close flow either way it's triggered. */}
                {msg.suggest_close && !isClosed && (
                  <Button variant="outline" size="sm" onClick={() => setConfirmingClose(true)} className="mt-1.5">
                    Close case
                  </Button>
                )}
                {/* The agent's own offer to hand off to a person, attached to
                    the specific reply that made it. Once accepted the case-
                    level humanRequested flag (not this per-message flag)
                    drives the disabled-input state, so this button doesn't
                    need to re-check anything else before rendering. */}
                {msg.suggest_human && !isClosed && !humanRequested && (
                  <Button variant="outline" size="sm" onClick={onRequestHuman} disabled={requestingHuman} className="mt-1.5">
                    <HeadsetIcon className="size-3.5" />
                    Request a person
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {adminTyping && (
          <div className="flex gap-2 flex-row-reverse max-sm:flex-row">
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
          <div className="flex gap-2 flex-row-reverse max-sm:flex-row">
            <AgentBadge thinking />
            <div className="flex flex-col gap-1 min-w-0 flex-1 items-end max-sm:items-start pt-0.5">
              <AgentThinking />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 mt-2 relative flex flex-col w-full lg:max-w-[55%] mx-auto">
        {/* Fades scrolled-past message content out under the input instead
            of it cutting off hard against the input's own background.
            Positioned directly against this wrapper (no padding on it, so
            bottom-full sits flush against the bar/form with no gap) — the
            gap above the wrapper itself now comes from its own margin-top
            instead, which the fade isn't measured against. */}
        <div className="flex flex-col relative">
        <div className={`pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-background to-transparent ${(isClosed || isAiBarred || humanRequested) ? "" : "rounded-t-2xl"}`} />
        {isClosed && (
          <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
            <span className="text-sm text-muted-foreground">Need further help with this case?</span>
            <Button variant="outline" size="sm" onClick={onCreateFollowUp} disabled={creatingFollowUp}>
              {creatingFollowUp ? "Creating..." : "Create follow-up"}
            </Button>
          </div>
        )}
        {!isClosed && humanRequested && (
          <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
            <span className="text-sm text-muted-foreground">
              You&rsquo;ve asked for a person. Sending is paused here until they reply, no need to send anything else in the meantime.
            </span>
            <button
              type="button"
              onClick={onUndoHuman}
              disabled={requestingHuman}
              className="flex items-center gap-1 h-7 pl-2.5 pr-3 rounded-full border bg-background text-[12px] font-medium tracking-tight hover:bg-sidebar-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <UndoIcon className="size-3" />
              Undo
            </button>
          </div>
        )}
        {!isClosed && !humanRequested && isAiBarred && (
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
          className={`flex flex-col gap-2.5 px-3 py-3 border bg-muted/30 focus-within:border-ring transition-colors ${(isClosed || isAiBarred || humanRequested) ? "rounded-b-xl" : "rounded-2xl"} ${inputDisabled ? "opacity-60" : ""}`}
          style={{ minHeight: 120, "--sh-ring": "var(--sh-muted-foreground)" } as React.CSSProperties}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-background pl-1 pr-3.5 py-1">
            <Avatar className="h-6 w-6 shrink-0">
              {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
              <AvatarFallback>{initials(clientName)}</AvatarFallback>
            </Avatar>
            <span className="text-[13px] font-medium tracking-tight">{clientName}</span>
          </div>
          {humanRequested ? (
            <span className="text-[15px] tracking-tight text-muted-foreground">Waiting on a reply&hellip;</span>
          ) : (
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              onChange={onDraftChange}
              onKeyDown={onKeyDown}
              disabled={inputDisabled}
              placeholder="Send a message..."
              className="w-full resize-none tracking-tight placeholder:text-muted-foreground focus:outline-none leading-relaxed bg-transparent disabled:cursor-not-allowed"
              style={{ maxHeight: 100, overflowY: "auto", fontSize: 16 }}
            />
          )}
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
              disabled={!draft.trim() || sending || inputDisabled}
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
              You can still start a new case for this later if it comes back. Closing just marks this one resolved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmingClose(false)} disabled={closing}>
              Cancel
            </Button>
            <Button
              onClick={onCloseCase}
              disabled={closing}
              style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.3)" }}
              className="hover:opacity-90"
            >
              {closing ? "Closing..." : "Close case"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
