"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FileManager, type FileManagerItem } from "@/components/file-manager";
import { StatusBadge } from "../clients/[id]/status-badge";
import { fmt$, fmtDate } from "../clients/[id]/types";
import { addFile, deleteFile, getSignedFileUrl } from "../actions";
import type { DocumentInvoice, DocumentFile } from "../data";

function InvoicesFileManager({ invoices }: { invoices: DocumentInvoice[] }) {
  const [preview, setPreview] = useState<DocumentInvoice | null>(null);

  const items: FileManagerItem[] = useMemo(() => {
    const folders: FileManagerItem[] = [];
    const seen = new Set<string>();
    for (const inv of invoices) {
      if (!seen.has(inv.clientId)) {
        seen.add(inv.clientId);
        folders.push({ id: `folder-${inv.clientId}`, name: inv.clientName, kind: "folder", path: "/" });
      }
    }
    const files: FileManagerItem[] = invoices.map(inv => ({
      id: inv.id,
      name: inv.label,
      kind: "file",
      path: `/${inv.clientName}`,
      size: fmt$(inv.amount),
      modified: inv.dueDate ? fmtDate(inv.dueDate) ?? "" : "",
      type: "invoice",
    }));
    return [...folders, ...files];
  }, [invoices]);

  const invoiceMap = useMemo(() => new Map(invoices.map(inv => [inv.id, inv])), [invoices]);

  return (
    <>
      <FileManager
        files={items}
        onOpen={(file) => {
          const inv = invoiceMap.get(file.id);
          if (inv) setPreview(inv);
        }}
      />
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{preview?.label}</DialogTitle>
            <DialogDescription>{preview?.clientName}</DialogDescription>
          </DialogHeader>
          {preview && (
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium tabular-nums">{fmt$(preview.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={preview.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Due date</span>
                <span>{fmtDate(preview.dueDate) ?? "—"}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ProjectFilesManager({ files }: { files: DocumentFile[] }) {
  const router = useRouter();
  const [data, setData] = useState(files);

  const items: FileManagerItem[] = useMemo(() => {
    const folders: FileManagerItem[] = [];
    const seen = new Set<string>();
    for (const f of data) {
      if (!seen.has(f.clientId)) {
        seen.add(f.clientId);
        folders.push({ id: `folder-${f.clientId}`, name: f.clientName, kind: "folder", path: "/" });
      }
    }
    const fileItems: FileManagerItem[] = data.map(f => ({
      id: f.id,
      name: f.label,
      kind: "file",
      path: `/${f.clientName}`,
      modified: fmtDate(f.uploadedAt) ?? "",
    }));
    return [...folders, ...fileItems];
  }, [data]);

  const fileMap = useMemo(() => new Map(data.map(f => [f.id, f])), [data]);
  const clientIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of data) map.set(f.clientName, f.clientId);
    return map;
  }, [data]);

  return (
    <FileManager
      files={items}
      onOpen={async (file) => {
        const f = fileMap.get(file.id);
        if (!f) return;
        const res = await getSignedFileUrl(f.url);
        if (res.url) window.open(res.url, "_blank", "noreferrer");
      }}
      onDelete={async (file) => {
        const f = fileMap.get(file.id);
        if (!f) return;
        setData(prev => prev.filter(x => x.id !== f.id));
        await deleteFile(f.id, f.clientId);
        router.refresh();
      }}
      onUpload={async (path, uploadFiles) => {
        const clientName = path.replace(/^\//, "");
        const clientId = clientIdByName.get(clientName);
        if (!clientId) return;
        for (const uf of uploadFiles) {
          const fd = new FormData();
          fd.append("file", uf.file);
          fd.append("label", uf.file.name);
          await addFile(clientId, fd);
        }
        router.refresh();
      }}
    />
  );
}

export function DocumentsView({ invoices, files }: { invoices: DocumentInvoice[]; files: DocumentFile[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Documents</h1>
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="files">Project files</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
          <InvoicesFileManager invoices={invoices} />
        </TabsContent>
        <TabsContent value="files">
          <ProjectFilesManager files={files} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
