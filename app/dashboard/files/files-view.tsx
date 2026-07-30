"use client";

import { useMemo } from "react";
import Link from "next/link";
import { FolderOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileManager, type FileManagerItem } from "@/components/file-manager";
import { getSignedFileUrl } from "../actions";
import { fmtDate, type DFile } from "../types";

export function FilesView({ files }: { files: DFile[] }) {
  const items: FileManagerItem[] = useMemo(
    () =>
      files.map((f) => ({
        id: f.id,
        name: f.label,
        kind: "file",
        path: "/",
        modified: fmtDate(f.uploaded_at) ?? "",
      })),
    [files]
  );

  const fileMap = useMemo(() => new Map(files.map((f) => [f.id, f])), [files]);

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <FolderOpenIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No files yet</p>
            <p className="text-[13px] text-muted-foreground">Files we share with you will show up here.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-1" nativeButton={false} render={<Link href="/dashboard/messages/new" />}>
            Ask for a file
          </Button>
        </div>
      ) : (
        <FileManager
          files={items}
          mobileMode="list"
          showBackButton={false}
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
