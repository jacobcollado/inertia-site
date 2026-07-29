"use client";

import { useRef, useState, useTransition } from "react";
import { UploadIcon, TrashIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { uploadAvatar, removeAvatar } from "@/app/admin/account-actions";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function AccountDialog({
  open,
  onOpenChange,
  displayName,
  email,
  avatarUrl,
  onAvatarChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  onAvatarChange: (url: string | null) => void;
}) {
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadAvatar(fd);
      if (res.error) {
        setError(res.error);
        setPreview(avatarUrl);
        return;
      }
      if (res.avatarUrl) {
        setPreview(res.avatarUrl);
        onAvatarChange(res.avatarUrl);
      }
    });
  };

  const onRemove = () => {
    setError("");
    startTransition(async () => {
      const res = await removeAvatar();
      if (res.error) { setError(res.error); return; }
      setPreview(null);
      onAvatarChange(null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Update your profile photo.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <Avatar className="h-20 w-20">
            {preview && <AvatarImage src={preview} alt={email} />}
            <AvatarFallback className="text-lg">{initials(displayName)}</AvatarFallback>
          </Avatar>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onPickFile} disabled={pending}>
              <UploadIcon />
              {pending ? "Uploading…" : "Upload photo"}
            </Button>
            {preview && (
              <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={pending}>
                <TrashIcon />
                Remove
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="w-full text-center text-sm text-muted-foreground border-t pt-3">
            {email}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
