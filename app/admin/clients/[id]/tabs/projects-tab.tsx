"use client";

import { useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "../status-badge";
import { createProject, addProjectUpdate } from "../../../actions";
import type { Project, ProjectUpdate } from "../types";

const PROJECT_STATUSES = ["active", "paused", "on_hold", "completed"] as const;

function AddProjectDialog({ clientId, open, onOpenChange }: { clientId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await createProject(clientId, fd);
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add project</DialogTitle>
          <DialogDescription>Create a new project for this client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Project title" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="phase">Phase</Label>
            <Input id="phase" name="phase" placeholder="e.g. Design review" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="active">
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="target_date">Target date</Label>
              <Input id="target_date" name="target_date" type="date" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Notes visible to client" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UpdateStatusDialog({
  project,
  clientId,
  open,
  onOpenChange,
  onPosted,
}: {
  project: Project;
  clientId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPosted: (update: ProjectUpdate) => void;
}) {
  const [status, setStatus] = useState(project.status);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry: ProjectUpdate = {
      id: `optimistic-${Date.now()}`,
      project_id: project.id,
      status,
      note: note || null,
      created_at: new Date().toISOString(),
    };
    onPosted(newEntry);
    const s = status, n = note;
    setNote("");
    onOpenChange(false);
    startTransition(async () => {
      await addProjectUpdate(project.id, clientId, s, n || null);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post update</DialogTitle>
          <DialogDescription>{project.title}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="update-status">Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger id="update-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="update-note">Note</Label>
            <Textarea id="update-note" value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="Note (optional)" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Posting..." : "Post update"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProjectCard({ project, updates, clientId }: { project: Project; updates: ProjectUpdate[]; clientId: string }) {
  const [open, setOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [localUpdates, setLocalUpdates] = useState(updates);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <Card className="gap-0 py-0">
      <div className="flex items-start justify-between gap-4 px-5 py-4 group">
        <button onClick={() => setOpen(o => !o)} className="flex flex-col gap-1 min-w-0 text-left">
          <span className="text-[15px] font-medium tracking-tight text-foreground hover:opacity-70 transition-opacity">{project.title}</span>
          {project.phase && <span className="text-[13px] tracking-tight text-muted-foreground">{project.phase}</span>}
          {project.notes && <p className="text-[13px] tracking-tight text-muted-foreground leading-relaxed max-w-md">{project.notes}</p>}
        </button>
        <div className="flex items-center gap-3 shrink-0">
          <StatusBadge status={localUpdates[0]?.status ?? project.status} />
          <Button variant="ghost" size="sm" onClick={() => setUpdateOpen(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
            Update
          </Button>
        </div>
      </div>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-sidebar-border pt-4">
          {localUpdates.length === 0 ? (
            <p className="text-[13px] tracking-tight text-muted-foreground">No updates yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {localUpdates.map(u => (
                <div key={u.id} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    <span className="text-[12px] tracking-tight text-muted-foreground">{fmtDate(u.created_at)}</span>
                  </div>
                  {u.note && <p className="text-[14px] tracking-tight text-muted-foreground leading-relaxed ml-1">{u.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <UpdateStatusDialog
        project={project}
        clientId={clientId}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        onPosted={(entry) => { setLocalUpdates(prev => [entry, ...prev]); setOpen(true); }}
      />
    </Card>
  );
}

export function ProjectsTab({ clientId, projects, projectUpdates }: { clientId: string; projects: Project[]; projectUpdates: ProjectUpdate[] }) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Projects</h2>
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon />
          Add project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-[14px] tracking-tight text-muted-foreground py-4">No projects yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} updates={projectUpdates.filter(u => u.project_id === p.id)} clientId={clientId} />
          ))}
        </div>
      )}

      <AddProjectDialog clientId={clientId} open={adding} onOpenChange={setAdding} />
    </div>
  );
}
