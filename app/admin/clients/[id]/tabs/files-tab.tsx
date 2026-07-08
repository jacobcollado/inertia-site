"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, TrashIcon, UploadCloudIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { addFile, deleteFile, getSignedFileUrl } from "../../../actions";
import { fmtDate, type DFile } from "../types";

function OpenFileButton({ url }: { url: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const res = await getSignedFileUrl(url);
    setLoading(false);
    if (res.url) window.open(res.url, "_blank", "noreferrer");
  };
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={loading}>
      {loading ? "..." : "Open"}
    </Button>
  );
}

function UploadFileDialog({ clientId, open, onOpenChange, onUploaded }: {
  clientId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const uploadFile = async (f: File, label?: string) => {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", f);
    fd.append("label", label || f.name);
    const res = await addFile(clientId, fd);
    setUploading(false);
    if (res.error) { setError(res.error); return; }
    setFile(null);
    onOpenChange(false);
    onUploaded();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    const label = (e.currentTarget.elements.namedItem("label") as HTMLInputElement)?.value;
    uploadFile(file, label);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>Add a file to this client's portal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`flex flex-col items-center justify-center gap-2 border border-dashed rounded-xl px-6 py-8 cursor-pointer transition-colors ${dragOver ? "border-foreground bg-muted/40" : "border-input"}`}
          >
            <UploadCloudIcon className="size-5 text-muted-foreground" />
            <span className="text-[13px] tracking-tight text-muted-foreground">
              {file ? file.name : "Drop a file or click to browse"}
            </span>
            <input type="file" className="hidden" disabled={uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
          </label>
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Custom label</Label>
            <Input id="label" name="label" placeholder="Optional" />
          </div>
          {error && <p className="text-[13px] text-destructive tracking-tight">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={uploading || !file}>{uploading ? "Uploading..." : "Upload"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function FilesTab({ clientId, files }: { clientId: string; files: DFile[] }) {
  const [data, setData] = useState(files);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => setData(files), [files]);

  const onDelete = (fileId: string) => {
    startTransition(async () => {
      await deleteFile(fileId, clientId);
      setData(prev => prev.filter(f => f.id !== fileId));
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Files</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon />
          Upload file
        </Button>
      </div>

      {data.length === 0 ? (
        <p className="text-[14px] tracking-tight text-muted-foreground py-4">No files yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((f) => (
            <Card key={f.id} className="flex-row items-center justify-between gap-4 px-4 py-4 group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[10px] font-bold tracking-wider bg-sidebar-accent text-muted-foreground">
                  {(f.label.match(/\.([a-zA-Z0-9]+)$/) ?? ["", ""])[1].toUpperCase().slice(0, 4) || "FILE"}
                </div>
                <div className="min-w-0">
                  <span className="text-[15px] font-medium tracking-tight text-foreground truncate block">{f.label}</span>
                  <span className="text-[12px] tracking-tight text-muted-foreground">{fmtDate(f.uploaded_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <OpenFileButton url={f.url} />
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity" disabled={pending} onClick={() => onDelete(f.id)}>
                  <TrashIcon />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <UploadFileDialog clientId={clientId} open={adding} onOpenChange={setAdding} onUploaded={() => router.refresh()} />
    </div>
  );
}
