"use client";

import { useMemo } from "react";
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
        <p className="text-sm text-muted-foreground py-8">No files yet.</p>
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
