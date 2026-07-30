"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PaperclipIcon, ArrowUpIcon } from "lucide-react";
import { useWebHaptics } from "web-haptics/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createCaseWithMessage } from "../../actions";

export function NewCaseView({ clientName, clientAvatarUrl }: {
  clientName: string;
  clientAvatarUrl: string | null;
}) {
  const { trigger } = useWebHaptics();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    trigger("light");
    setSending(true);
    const result = await createCaseWithMessage(body);
    if (result.success && result.caseId) {
      router.push(`/dashboard/messages/${result.caseId}`);
      return;
    }
    setSending(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="flex flex-col gap-0 min-h-[calc(100vh-56px-7rem)] md:min-h-[calc(100vh-56px-2rem)] lg:min-h-[calc(100vh-56px-3rem)]">
      <div className="shrink-0 flex items-center gap-3 px-1 py-3 border-b">
        <Link href="/dashboard/messages" className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeftIcon className="size-4" />
        </Link>
        <span className="text-[15px] font-medium tracking-tight">New case</span>
      </div>

      <div className="flex-1" />

      <div className="shrink-0 flex flex-col gap-3 pt-2 pb-4 w-full lg:max-w-[55%] mx-auto">
        <p className="px-1 text-[20px] font-medium tracking-tight">How can we help you?</p>
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className="flex flex-col gap-2.5 px-3 py-3 rounded-2xl border bg-muted/30 focus-within:border-ring transition-colors"
          style={{ minHeight: 180 }}
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
            placeholder="Describe what's going on..."
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
      </div>
    </div>
  );
}
