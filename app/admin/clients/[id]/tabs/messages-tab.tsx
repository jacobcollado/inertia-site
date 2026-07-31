"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDownIcon, ArrowUpIcon, MessageCircleIcon, CheckIcon, AlertTriangleIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { sendAdminMessage, markMessagesRead, updateCaseSeverity, updateCaseStatus, suggestAdminReply } from "../../../actions";
import { CASE_STATUS_VARIANT, CASE_SEVERITY_LABEL, type Message, type Case, type CaseStatus, type CaseSeverity } from "../types";

const STATUS_OPTIONS: CaseStatus[] = ["open", "pending", "closed"];
const SEVERITY_OPTIONS: CaseSeverity[] = ["severity_1", "severity_2", "severity_3", "severity_4"];
const STATUS_FILTERS: { value: "all" | CaseStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
];


function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// Admin's own badge, mirroring the client dashboard's AgentBadge — square and
// distinct from the client's circular Avatar, sized to the same h-8 w-8
// footprint, initials instead of the dots since this is a real person, not
// the AI agent.
function AdminBadge() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background text-[12px] font-semibold">
      A
    </span>
  );
}

export function MessagesTab({ clientId, messages, setMessages, cases: initialCases, clientName, clientAvatarUrl }: {
  clientId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  cases: Case[];
  clientName: string;
  clientAvatarUrl: string | null;
}) {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCases[0]?.id ?? null);
  const [statusFilter, setStatusFilter] = useState<"all" | CaseStatus>("all");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [clientTyping, setClientTyping] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) ?? null;
  const filteredCases = useMemo(
    () => statusFilter === "all" ? cases : cases.filter(c => c.status === statusFilter),
    [cases, statusFilter]
  );
  const caseMessages = useMemo(
    () => messages.filter(m => m.case_id === selectedCaseId),
    [messages, selectedCaseId]
  );

  // A case is "waiting on the client" once admin has sent the last message
  // and the client hasn't replied yet (and the case isn't closed).
  const waitingOnClientById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const c of cases) {
      if (c.status === "closed") { map.set(c.id, false); continue; }
      const forCase = messages.filter(m => m.case_id === c.id);
      const last = forCase[forCase.length - 1];
      map.set(c.id, last?.sender === "admin");
    }
    return map;
  }, [cases, messages]);

  const lastCaseMessage = caseMessages[caseMessages.length - 1];

  // Fetches a suggested reply whenever the client's latest message changes —
  // only worth asking for when the client sent last (no point suggesting a
  // reply to something the admin just said) and the case is still open.
  // Keyed by message id, not just case id, so a fresh client message
  // re-triggers a fresh suggestion instead of reusing a stale one.
  useEffect(() => {
    setSuggestion(null);
    if (!selectedCase || selectedCase.status === "closed") return;
    if (!lastCaseMessage || lastCaseMessage.sender !== "client") return;
    if (dismissedFor === lastCaseMessage.id) return;

    let cancelled = false;
    setSuggestionLoading(true);
    suggestAdminReply(caseMessages.map(m => ({ sender: m.sender, body: m.body })))
      .then(res => {
        if (!cancelled && res.suggestion) setSuggestion(res.suggestion);
      })
      .finally(() => {
        if (!cancelled) setSuggestionLoading(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastCaseMessage?.id, selectedCase?.id, selectedCase?.status]);

  useEffect(() => {
    if (!selectedCaseId) return;
    markMessagesRead(clientId, selectedCaseId);
    setMessages(prev => prev.map(m => m.sender === "client" && m.case_id === selectedCaseId && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, selectedCaseId]);

  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`client-messages:${clientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const incoming = payload.new as Message;
        setMessages(prev => {
          // Already have this exact row — e.g. onSend's own optimistic
          // append already resolved into the real row, and Realtime is now
          // delivering the same INSERT. Skip it rather than duplicating.
          if (prev.some(m => m.id === incoming.id)) return prev;
          const idx = prev.findIndex(m =>
            m.id.startsWith("optimistic-") &&
            m.sender === incoming.sender &&
            m.body === incoming.body
          );
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = incoming;
            return next;
          }
          return [...prev, incoming];
        });
        if (incoming.sender === "client" && incoming.case_id === selectedCaseId) {
          markMessagesRead(clientId, selectedCaseId);
          setMessages(prev => prev.map(m => m.sender === "client" && m.case_id === selectedCaseId && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `client_id=eq.${clientId}`,
      }, (payload) => {
        const updated = payload.new as Message;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        if (payload.payload?.sender === "client") {
          setClientTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setClientTyping(false), 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, selectedCaseId]);

  useEffect(() => {
    // Scrolls only the message list itself, not the whole page — same fix as
    // the client dashboard's own thread view (case-thread-view.tsx).
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [caseMessages, clientTyping]);

  const onBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "admin" } });
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !selectedCaseId) return;
    const text = body.trim();
    setBody("");
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      client_id: clientId,
      case_id: selectedCaseId,
      sender: "admin",
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);
    startTransition(async () => {
      await sendAdminMessage(clientId, text, selectedCaseId);
    });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e as unknown as React.FormEvent); }
  };

  const onSeverityChange = (severity: CaseSeverity) => {
    if (!selectedCase) return;
    setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, severity } : c));
    startTransition(async () => { await updateCaseSeverity(selectedCase.id, clientId, severity); });
  };

  const onStatusChange = (status: CaseStatus) => {
    if (!selectedCase) return;
    setCases(prev => prev.map(c => c.id === selectedCase.id ? { ...c, status } : c));
    startTransition(async () => { await updateCaseStatus(selectedCase.id, clientId, status); });
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const fmtDay = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";
    const sameYear = d.getFullYear() === today.getFullYear();
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(!sameYear && { year: "numeric" }) });
  };

  let lastDay = "";

  if (cases.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Messages</h2>
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <MessageCircleIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No cases yet</p>
            <p className="text-[13px] text-muted-foreground">Cases this client opens will show up here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-[calc(100dvh-19rem)] md:h-[calc(100dvh-16rem)]" style={{ minHeight: 360 }}>
      {/* Desktop: full case list as a left rail. Mobile: replaced by the
          dropdown below (a fixed-width sidebar next to a narrow chat pane
          doesn't fit a phone screen), so this whole block is desktop-only. */}
      <div className="hidden md:flex w-64 shrink-0 flex-col gap-4 overflow-y-auto pr-2">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Messages</h2>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium tracking-tight transition-colors ${statusFilter === f.value ? "bg-foreground text-background" : "bg-sidebar-accent text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-1">
          {filteredCases.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-muted-foreground">No cases match this filter.</p>
          ) : filteredCases.map(c => {
            const waiting = waitingOnClientById.get(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCaseId(c.id)}
                className={`flex items-center justify-between gap-2 text-left rounded-md px-3 py-2.5 transition-colors ${c.id === selectedCaseId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"}`}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-medium tracking-tight truncate">{c.title}</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">#{c.case_number}</div>
                </div>
                {c.human_requested && <span className="size-1.5 rounded-full bg-blue-500 shrink-0" title="Client requested a person" />}
                {!c.human_requested && waiting && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Waiting on client response" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-2">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Messages</h2>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-full px-2.5 py-1 text-[12px] font-medium tracking-tight transition-colors ${statusFilter === f.value ? "bg-foreground text-background" : "bg-sidebar-accent text-muted-foreground hover:text-foreground"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {filteredCases.length === 0 ? (
          <p className="rounded-md border bg-sidebar px-4 py-2.5 text-[13px] text-muted-foreground">No cases match this filter.</p>
        ) : filteredCases.length > 1 ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex items-center justify-between gap-2 w-full rounded-md border bg-sidebar px-4 py-2.5 text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
                />
              }
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">{selectedCase && filteredCases.some(c => c.id === selectedCase.id) ? selectedCase.title : "Select a case"}</span>
                {selectedCase && waitingOnClientById.get(selectedCase.id) && (
                  <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Waiting on client response" />
                )}
              </span>
              <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-64">
              {filteredCases.map(c => (
                <DropdownMenuItem key={c.id} onClick={() => setSelectedCaseId(c.id)}>
                  <div className="flex items-center justify-between gap-2 w-full min-w-0">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium tracking-tight truncate">{c.title}</div>
                      <div className="text-[12px] text-muted-foreground">#{c.case_number}</div>
                    </div>
                    {waitingOnClientById.get(c.id) && (
                      <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Waiting on client response" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedCaseId(filteredCases[0].id)}
            className="rounded-md border bg-sidebar px-4 py-2.5 text-left"
          >
            <div className="text-[14px] font-medium tracking-tight truncate">{filteredCases[0].title}</div>
            <div className="text-[12px] text-muted-foreground">#{filteredCases[0].case_number}</div>
          </button>
        )}
      </div>

      <div className="flex-1 min-w-0 relative flex flex-col gap-0 rounded-sm border bg-sidebar px-5 pt-5">
        {selectedCase && (
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-sidebar-border">
            <div className="min-w-0">
              <h3 className="text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground truncate">{selectedCase.title}</h3>
              <span className="text-[12px] text-muted-foreground">#{selectedCase.case_number}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {waitingOnClientById.get(selectedCase.id) && (
                <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  Waiting on client
                </Badge>
              )}
              {/* One-tap shortcuts for the two most common actions, instead
                  of always going through the status/severity dropdowns. */}
              {selectedCase.human_requested && (
                <Badge variant="outline" className="border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400">
                  Person requested
                </Badge>
              )}
              {selectedCase.status !== "closed" && (
                <button
                  type="button"
                  onClick={() => onStatusChange("closed")}
                  title="Mark resolved"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <CheckIcon className="size-4" />
                </button>
              )}
              {selectedCase.severity !== "severity_1" && (
                <button
                  type="button"
                  onClick={() => onSeverityChange("severity_1")}
                  title="Escalate to Severity 1"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
                >
                  <AlertTriangleIcon className="size-4" />
                </button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button type="button" className="flex items-center gap-1">
                      <Badge variant="outline" className="cursor-pointer border-transparent bg-muted text-muted-foreground">
                        {CASE_SEVERITY_LABEL[selectedCase.severity]}
                        <ChevronDownIcon className="size-3" />
                      </Badge>
                    </button>
                  }
                />
                <DropdownMenuContent align="end">
                  {SEVERITY_OPTIONS.map(s => (
                    <DropdownMenuItem key={s} onClick={() => onSeverityChange(s)}>
                      {CASE_SEVERITY_LABEL[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button type="button" className="flex items-center gap-1">
                      <Badge variant="outline" className={`cursor-pointer capitalize border-transparent ${CASE_STATUS_VARIANT[selectedCase.status]}`}>
                        {selectedCase.status}
                        <ChevronDownIcon className="size-3" />
                      </Badge>
                    </button>
                  }
                />
                <DropdownMenuContent align="end">
                  {STATUS_OPTIONS.map(s => (
                    <DropdownMenuItem key={s} className="capitalize" onClick={() => onStatusChange(s)}>
                      {s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        <div ref={listRef} className="flex-1 overflow-y-auto overscroll-contain flex flex-col gap-6 pr-1 pb-4">
          {caseMessages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 opacity-60">
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </div>
          )}
          {caseMessages.map((m) => {
            const day = fmtDay(m.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const isAdmin = m.sender === "admin";
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-sidebar-border" />
                    <span className="text-[11px] tracking-tight text-muted-foreground shrink-0">{day}</span>
                    <div className="flex-1 h-px bg-sidebar-border" />
                  </div>
                )}
                <div className={`flex items-start gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}>
                  <div className="-mt-1.5">
                    {isAdmin ? <AdminBadge /> : (
                      <Avatar className="h-8 w-8 shrink-0">
                        {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
                        <AvatarFallback>{initials(clientName)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                  <div className={`flex flex-col gap-1 min-w-0 flex-1 ${isAdmin ? "items-end" : "items-start"}`}>
                    <div className={`flex items-baseline gap-2 ${isAdmin ? "flex-row-reverse" : ""}`}>
                      <span className="text-[14px] font-semibold tracking-tight">{isAdmin ? "You" : clientName}</span>
                      <span className="text-xs text-muted-foreground">{fmtTime(m.created_at)}{isAdmin && m.read_at && " · Read"}</span>
                    </div>
                    <p className="max-w-[85%] sm:max-w-[75%] text-[15px] leading-relaxed whitespace-pre-wrap text-left">{m.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {clientTyping && (
            <div className="flex items-start gap-3">
              <div className="-mt-1.5">
                <Avatar className="h-8 w-8 shrink-0">
                  {clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
                  <AvatarFallback>{initials(clientName)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="flex items-center gap-1 pt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 relative flex flex-col">
          {/* Fades scrolled-past message content out under the input instead
              of it cutting off hard — same treatment as the client
              dashboard's own thread view. */}
          <div className={`pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-t from-sidebar to-transparent ${(suggestion || suggestionLoading) ? "" : "rounded-t-2xl"}`} />
          {suggestionLoading && (
            <div className="flex items-center gap-2.5 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
              <img src="/claude-logo.svg" alt="" className="size-4 shrink-0 rounded-full opacity-60" />
              <span className="text-sm text-muted-foreground">Thinking of a reply&hellip;</span>
            </div>
          )}
          {suggestion && !suggestionLoading && (
            <div className="flex items-start gap-2.5 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
              <img src="/claude-logo.svg" alt="" className="size-4 shrink-0 rounded-full mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => { setBody(suggestion); setDismissedFor(lastCaseMessage?.id ?? null); setSuggestion(null); }}
                    className="rounded-full bg-foreground text-background px-3 py-1 text-[12px] font-medium tracking-tight hover:opacity-85 transition-opacity"
                  >
                    Use this
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDismissedFor(lastCaseMessage?.id ?? null); setSuggestion(null); }}
                    className="rounded-full px-3 py-1 text-[12px] font-medium tracking-tight text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}
          <form
            onSubmit={onSend}
            className={`flex flex-col gap-2.5 px-3 py-3 mb-5 border bg-muted/30 focus-within:border-ring transition-colors ${(suggestion || suggestionLoading) ? "rounded-b-xl" : "rounded-2xl"}`}
            style={{ minHeight: 100, "--sh-ring": "var(--sh-muted-foreground)" } as React.CSSProperties}
          >
            <textarea
              value={body}
              onChange={onBodyChange}
              onKeyDown={onKeyDown}
              placeholder="Send a message..."
              rows={1}
              className="w-full resize-none tracking-tight placeholder:text-muted-foreground focus:outline-none leading-relaxed bg-transparent"
              style={{ maxHeight: 100, overflowY: "auto", fontSize: 16 }}
            />
            <div className="flex items-center justify-end mt-auto">
              <button
                type="submit"
                disabled={pending || !body.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full border bg-background text-foreground transition-opacity hover:bg-sidebar-accent/40 disabled:opacity-40 disabled:hover:bg-background"
              >
                <ArrowUpIcon className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
