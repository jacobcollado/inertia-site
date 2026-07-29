"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, MoreHorizontalIcon } from "lucide-react";
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
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { sendClientMessage, markAdminMessagesRead, createFollowUpCase } from "../../actions";
import { CASE_STATUS_VARIANT, CASE_SEVERITY_LABEL, fmtDate, type Case, type Message } from "../../types";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function CaseThreadView({ clientId, caseData, messages: initialMessages, clientName, clientAvatarUrl }: {
  clientId: string;
  caseData: Case;
  messages: Message[];
  clientName: string;
  clientAvatarUrl: string | null;
}) {
  const { trigger } = useWebHaptics();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markRead = () => {
    setMessages(prev => prev.map(m => m.sender === "admin" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    markAdminMessagesRead(caseData.id);
  };

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, adminTyping]);

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
    await sendClientMessage(body, caseData.id);
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const fmtMsgTime = (iso: string) =>
    new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  const isClosed = caseData.status === "closed";

  const onCreateFollowUp = async () => {
    if (creatingFollowUp) return;
    setCreatingFollowUp(true);
    const result = await createFollowUpCase(caseData.id, caseData.title);
    setCreatingFollowUp(false);
    if (result.success && result.caseId) {
      router.push(`/dashboard/messages/${result.caseId}`);
    }
  };

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 56px)", minHeight: 400 }}>
      <div className="shrink-0 flex items-center justify-between gap-4 px-1 py-3 border-b">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard/messages" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeftIcon className="size-4" />
          </Link>
          <span className="text-[15px] font-medium tracking-tight truncate">{caseData.title}</span>
          <span className="text-[13px] text-muted-foreground shrink-0">updated {fmtDate(caseData.updated_at)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
            {CASE_SEVERITY_LABEL[caseData.severity]}
          </Badge>
          <Badge variant="outline" className={`border-transparent capitalize ${CASE_STATUS_VARIANT[caseData.status]}`}>
            {caseData.status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon />
              <span className="sr-only">Case actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href="/dashboard/messages" />}>
                All cases
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-6 px-1 py-6 w-full lg:max-w-[65%] mx-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 opacity-60">
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isClient = msg.sender === "client";
          return (
            <div key={msg.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                {isClient && clientAvatarUrl && <AvatarImage src={clientAvatarUrl} alt={clientName} />}
                <AvatarFallback>{isClient ? initials(clientName) : "IN"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-[14px] font-semibold tracking-tight">{isClient ? clientName : "Inertia Support"}</span>
                  <span className="text-xs text-muted-foreground">{fmtMsgTime(msg.created_at)}</span>
                </div>
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.body}</p>
              </div>
            </div>
          );
        })}

        {adminTyping && (
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback>IN</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-1 pt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 flex flex-col gap-2 pt-2 w-full lg:max-w-[65%] mx-auto">
        {isClosed && (
          <div className="flex items-center justify-between gap-3 rounded-t-xl border border-b-0 bg-sidebar px-4 py-3">
            <span className="text-sm text-muted-foreground">Need further help with this case?</span>
            <Button size="sm" onClick={onCreateFollowUp} disabled={creatingFollowUp}>
              {creatingFollowUp ? "Creating..." : "Create follow-up"}
            </Button>
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className={`flex items-end gap-2 px-3 py-2 border bg-muted/30 focus-within:border-ring transition-colors ${isClosed ? "rounded-b-xl" : "rounded-2xl"}`}
        >
          <textarea
            rows={1}
            value={draft}
            onChange={onDraftChange}
            onKeyDown={onKeyDown}
            placeholder="Send a message..."
            className="w-full resize-none tracking-tight placeholder:text-muted-foreground focus:outline-none leading-relaxed bg-transparent"
            style={{ maxHeight: 100, overflowY: "auto", fontSize: 16 }}
          />
          {draft.trim() && (
            <button
              type="submit"
              disabled={sending}
              className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium bg-primary text-primary-foreground transition-opacity disabled:opacity-25"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
