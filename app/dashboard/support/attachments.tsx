"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { FileTextIcon, LoaderCircleIcon, PaperclipIcon, XIcon } from "lucide-react";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { createAttachmentUpload, getSignedFileUrl } from "../actions";
import type { Attachment } from "../types";

// Mirrors ATTACHMENT_TYPES / limits in actions.ts, which the server enforces;
// these only stop a doomed upload before it starts.
export const ATTACHMENT_ACCEPT = "image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,application/zip,.zip";
const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;

// preview: a local object URL for images, so the thumbnail shows the moment
// a file is picked instead of waiting on the upload.
type Draft = { id: string; name: string; preview?: string; status: "uploading" | "done" | "error"; attachment?: Attachment; error?: string };

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* Files start uploading the moment they're picked, so sending is instant by
   the time the message is written. The composer holds send until every
   upload has settled. */
export function useAttachmentDraft() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const previews = useRef(new Map<string, string>());

  const revoke = (id?: string) => {
    for (const [key, url] of previews.current) {
      if (id && key !== id) continue;
      URL.revokeObjectURL(url);
      previews.current.delete(key);
    }
  };

  useEffect(() => () => revoke(), []);

  const update = (id: string, patch: Partial<Draft>) =>
    setDrafts(prev => prev.map(d => (d.id === id ? { ...d, ...patch } : d)));

  const add = (files: FileList | File[]) => {
    const accepted = Array.from(files)
      .slice(0, Math.max(0, MAX_FILES - drafts.length))
      .map(file => {
        const id = crypto.randomUUID();
        if (file.type.startsWith("image/")) previews.current.set(id, URL.createObjectURL(file));
        return { file, id };
      });
    setDrafts(prev => [
      ...prev,
      ...accepted.map(({ file, id }) => ({ id, name: file.name, preview: previews.current.get(id), status: "uploading" as const })),
    ]);

    for (const { file, id } of accepted) {
      (async () => {
        if (file.size > MAX_BYTES) return update(id, { status: "error", error: "Over 10 MB" });
        // Some browsers report zips without a type; the server needs one.
        const type = file.type || (file.name.toLowerCase().endsWith(".zip") ? "application/zip" : "");
        const signed = await createAttachmentUpload(file.name, file.size, type);
        if ("error" in signed) return update(id, { status: "error", error: signed.error });
        const { error } = await createBrowserClient().storage
          .from("client-files")
          .uploadToSignedUrl(signed.path, signed.token, file, { contentType: type });
        if (error) return update(id, { status: "error", error: "Upload failed" });
        update(id, { status: "done", attachment: { path: signed.path, name: file.name, size: file.size, type } });
      })();
    }
  };

  const remove = useCallback((id: string) => {
    revoke(id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  }, []);
  const clear = useCallback(() => {
    revoke();
    setDrafts([]);
  }, []);

  return {
    drafts,
    add,
    remove,
    clear,
    ready: drafts.flatMap(d => (d.attachment ? [d.attachment] : [])),
    uploading: drafts.some(d => d.status === "uploading"),
    full: drafts.length >= MAX_FILES,
  };
}

// A label wrapping the hidden input, not a button calling input.click(): iOS
// only opens the picker reliably from a direct tap on the label.
export function AttachButton({ onFiles, disabled }: { onFiles: (files: FileList) => void; disabled?: boolean }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      title="Attach files"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors",
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <PaperclipIcon className="size-4" />
      <span className="sr-only">Attach files</span>
      <input
        id={id}
        type="file"
        multiple
        accept={ATTACHMENT_ACCEPT}
        disabled={disabled}
        className="sr-only"
        onChange={e => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}

export function DraftAttachments({ drafts, onRemove }: { drafts: Draft[]; onRemove: (id: string) => void }) {
  if (drafts.length === 0) return null;
  return (
    <div className="flex flex-wrap items-end gap-1.5">
      {drafts.map(d => {
        const remove = (
          <button
            type="button"
            onClick={() => onRemove(d.id)}
            aria-label={`Remove ${d.name}`}
            className="flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-3" />
          </button>
        );

        if (d.preview) {
          return (
            <span
              key={d.id}
              title={d.error ? `${d.name} · ${d.error}` : d.name}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-lg border bg-background",
                d.status === "error" && "border-red-500/60",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
              <img src={d.preview} alt={d.name} className={cn("size-full object-cover", d.status === "error" && "opacity-40")} />
              {d.status === "uploading" && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/50">
                  <LoaderCircleIcon className="size-4 animate-spin text-foreground" />
                </span>
              )}
              {d.status === "error" && (
                <span className="absolute inset-x-0 bottom-0 bg-red-500/90 px-1 py-0.5 text-center text-[10px] font-medium text-white">
                  Failed
                </span>
              )}
              <span className="absolute right-0.5 top-0.5 rounded-full bg-background/90 shadow-sm">{remove}</span>
            </span>
          );
        }

        return (
          <span
            key={d.id}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background py-1 pl-2.5 pr-1 text-[12.5px] tracking-tight",
              d.status === "error" && "border-red-500/40 text-red-500",
            )}
          >
            {d.status === "uploading" ? (
              <LoaderCircleIcon className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate max-w-44">{d.name}</span>
            {d.error && <span className="shrink-0">· {d.error}</span>}
            {remove}
          </span>
        );
      })}
    </div>
  );
}

/* Attachments on a sent message. Files are private, so each link is a
   short-lived signed URL fetched when the message renders. Images show as a
   thumbnail, everything else as a file chip. */
export function MessageAttachments({ attachments, className }: { attachments?: Attachment[] | null; className?: string }) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const key = (attachments ?? []).map(a => a.path).join("|");

  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    Promise.all(
      key.split("|").map(async path => [path, (await getSignedFileUrl(path)).url] as const),
    ).then(entries => {
      if (cancelled) return;
      setUrls(Object.fromEntries(entries.filter((e): e is readonly [string, string] => !!e[1])));
    });
    return () => { cancelled = true; };
  }, [key]);

  if (!attachments?.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {attachments.map(a => {
        const url = urls[a.path];
        if (a.type.startsWith("image/")) {
          return (
            <a
              key={a.path}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg border bg-sidebar"
              aria-label={`Open ${a.name}`}
            >
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element -- signed, expiring storage URL
                <img src={url} alt={a.name} className="h-32 max-w-56 object-cover" />
              ) : (
                <span className="flex h-32 w-40 items-center justify-center">
                  <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />
                </span>
              )}
            </a>
          );
        }
        return (
          <a
            key={a.path}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-lg border bg-sidebar px-3 py-2 text-[13px] tracking-tight transition-colors hover:bg-sidebar-accent/60"
          >
            <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate max-w-48 font-medium">{a.name}</span>
            {a.size > 0 && <span className="shrink-0 text-muted-foreground">{fmtSize(a.size)}</span>}
          </a>
        );
      })}
    </div>
  );
}
