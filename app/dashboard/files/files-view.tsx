"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, FolderOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileManager, type FileManagerItem } from "@/components/file-manager";
import { getSignedFileUrl } from "../actions";
import { fmtDate, type DFile } from "../types";

const FILTERS = [
  { value: "all", label: "All files" },
  { value: "images", label: "Images" },
  { value: "documents", label: "Documents" },
  { value: "archives", label: "Archives" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

const EXTENSIONS: Record<Exclude<FilterValue, "all">, string[]> = {
  images: ["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "heic"],
  documents: ["pdf", "doc", "docx", "txt", "md", "rtf", "xls", "xlsx", "csv", "ppt", "pptx"],
  archives: ["zip", "rar", "7z", "tar", "gz"],
};

/* Type comes off the label rather than the url: a Supabase storage key can
 * carry a generated name, while the label is what the client was shown and
 * what they'd filter by. Falls back to the url when the label has no
 * extension. */
function extensionOf(file: DFile) {
  const fromLabel = file.label.split(".").pop()?.toLowerCase();
  if (fromLabel && fromLabel !== file.label.toLowerCase()) return fromLabel;
  return file.url.split(".").pop()?.toLowerCase() ?? "";
}

export function FilesView({ files }: { files: DFile[] }) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return files;
    const allowed = EXTENSIONS[filter];
    return files.filter((f) => allowed.includes(extensionOf(f)));
  }, [files, filter]);

  const items: FileManagerItem[] = useMemo(
    () =>
      filtered.map((f) => ({
        id: f.id,
        name: f.label,
        kind: "file",
        path: "/",
        modified: fmtDate(f.uploaded_at) ?? "",
      })),
    [filtered]
  );

  const fileMap = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);
  const filterLabel = FILTERS.find((f) => f.value === filter)?.label ?? "All files";

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      {/* Hidden when there's nothing to filter: a type switcher over an empty
          page is just a control that can't do anything. */}
      {files.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center justify-between gap-2 w-full rounded-md border bg-sidebar px-4 py-2 text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
              />
            }
          >
            {filterLabel}
            <ChevronDownIcon className="size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-56">
            {FILTERS.map((f) => (
              <DropdownMenuItem key={f.value} onClick={() => setFilter(f.value)}>
                {f.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FolderOpenIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No files yet</p>
            <p className="text-[13px] text-muted-foreground">Files we share with you will show up here.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-1" nativeButton={false} render={<Link href="/dashboard/support/new" />}>
            Ask for a file
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        // Distinct from the no-files empty state above: they do have files,
        // just none of this type, so the way out is changing the filter
        // rather than asking us for something.
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FolderOpenIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No matching files</p>
            <p className="text-[13px] text-muted-foreground">Try a different filter to see your other files.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-1" onClick={() => setFilter("all")}>
            Show all files
          </Button>
        </div>
      ) : (
        <FileManager
          files={items}
          mobileMode="list"
          showBackButton={false}
          allowUpload={false}
          // Clients get a flat list of shared files. With no folders to
          // navigate and nothing to upload, the toolbar holds only a dead
          // "Files" label and an item count, and the page's own filter sits
          // directly above it.
          showToolbar={false}
          showFolderChips={false}
          className="bg-sidebar"
          onOpen={async (file) => {
            const f = fileMap.get(file.id);
            if (!f) return;
            const res = await getSignedFileUrl(f.url);
            if (res.url) window.open(res.url, "_blank", "noreferrer");
          }}
        />
      )}
    </div>
  );
}
