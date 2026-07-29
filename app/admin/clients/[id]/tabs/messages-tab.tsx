"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SendIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { sendAdminMessage, markMessagesRead, updateCaseSeverity, updateCaseStatus } from "../../../actions";
import { CASE_STATUS_VARIANT, CASE_SEVERITY_LABEL, type Message, type Case, type CaseStatus, type CaseSeverity } from "../types";

const STATUS_OPTIONS: CaseStatus[] = ["open", "pending", "closed"];
const SEVERITY_OPTIONS: CaseSeverity[] = ["severity_1", "severity_2", "severity_3", "severity_4"];

export function MessagesTab({ clientId, messages, setMessages, cases: initialCases }: {
  clientId: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  cases: Case[];
}) {
  const [cases, setCases] = useState<Case[]>(initialCases);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(initialCases[0]?.id ?? null);
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [clientTyping, setClientTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCase = cases.find(c => c.id === selectedCaseId) ?? null;
  const caseMessages = useMemo(
    () => messages.filter(m => m.case_id === selectedCaseId),
    [messages, selectedCaseId]
  );

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="flex flex-col gap-0">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground mb-6">Messages</h2>
        <p className="text-[14px] tracking-tight text-muted-foreground py-6">No cases yet.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: "calc(100vh - 280px)", minHeight: 360 }}>
      <div className="w-64 shrink-0 flex flex-col gap-1 overflow-y-auto pr-2">
        <h2 className="text-[1.1rem] font-semibold tracking-[-0.02em] text-foreground mb-2">Cases</h2>
        {cases.map(c => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCaseId(c.id)}
            className={`text-left rounded-lg px-3 py-2.5 transition-colors ${c.id === selectedCaseId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/50"}`}
          >
            <div className="text-[13px] font-medium tracking-tight truncate">{c.title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">#{c.case_number}</div>
          </button>
        ))}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0">
        {selectedCase && (
          <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-sidebar-border">
            <div className="min-w-0">
              <h3 className="text-[1.2rem] font-semibold tracking-[-0.02em] text-foreground truncate">{selectedCase.title}</h3>
              <span className="text-[12px] text-muted-foreground">#{selectedCase.case_number}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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

        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-4">
          {caseMessages.length === 0 && (
            <p className="text-[14px] tracking-tight text-muted-foreground py-6">No messages yet.</p>
          )}
          {caseMessages.map((m) => {
            const day = fmtDay(m.created_at);
            const showDay = day !== lastDay;
            lastDay = day;
            const isAdmin = m.sender === "admin";
            return (
              <div key={m.id}>
                {showDay && (
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-sidebar-border" />
                    <span className="text-[11px] tracking-tight text-muted-foreground shrink-0">{day}</span>
                    <div className="flex-1 h-px bg-sidebar-border" />
                  </div>
                )}
                <div className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                    <div className={`px-4 py-2.5 text-[15px] tracking-tight leading-relaxed ${
                      isAdmin
                        ? "bg-primary text-white"
                        : "bg-sidebar-accent text-foreground"
                    }`} style={{ borderRadius: isAdmin ? "16px 16px 4px 16px" : "16px 16px 16px 4px" }}>
                      {m.body}
                    </div>
                    <span className="text-[11px] tracking-tight text-muted-foreground px-1">
                      {fmtTime(m.created_at)}
                      {isAdmin && m.read_at && " · Read"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {clientTyping && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-[16px_16px_16px_4px] flex items-center gap-1 bg-sidebar-accent">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={onSend} className="flex flex-col gap-2 p-3 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 focus-within:border-foreground/20 transition-colors">
          <Textarea
            value={body}
            onChange={onBodyChange}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e as unknown as React.FormEvent); } }}
            placeholder="Send a message..."
            rows={1}
            className="w-full resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
            style={{ maxHeight: 160, overflowY: "auto" }}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={pending || !body.trim()}>
              <SendIcon />
              {pending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
