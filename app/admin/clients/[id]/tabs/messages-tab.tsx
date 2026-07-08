"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { sendAdminMessage, markMessagesRead } from "../../../actions";
import type { Message } from "../types";

export function MessagesTab({ clientId, messages, setMessages }: { clientId: string; messages: Message[]; setMessages: React.Dispatch<React.SetStateAction<Message[]>> }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();
  const [clientTyping, setClientTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<ReturnType<typeof createBrowserClient>["channel"]> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    markMessagesRead(clientId);
    setMessages(prev => prev.map(m => m.sender === "client" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

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
        if (incoming.sender === "client") {
          markMessagesRead(clientId);
          setMessages(prev => prev.map(m => m.sender === "client" && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
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
  }, [clientId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, clientTyping]);

  const onBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value);
    channelRef.current?.send({ type: "broadcast", event: "typing", payload: { sender: "admin" } });
  };

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    const text = body.trim();
    setBody("");
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      client_id: clientId,
      sender: "admin",
      body: text,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages(prev => [...prev, optimistic]);
    startTransition(async () => {
      await sendAdminMessage(clientId, text);
    });
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

  return (
    <div className="flex flex-col gap-0" style={{ height: "calc(100vh - 280px)", minHeight: 360 }}>
      <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground mb-6">Messages</h2>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 pb-4">
        {messages.length === 0 && (
          <p className="text-[14px] tracking-tight text-muted-foreground py-6">No messages yet.</p>
        )}
        {messages.map((m) => {
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
  );
}
