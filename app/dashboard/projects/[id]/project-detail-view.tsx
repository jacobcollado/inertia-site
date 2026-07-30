"use client";

import Link from "next/link";
import { ArrowLeftIcon, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "../../status-pill";
import { fmtDate, type Project, type ProjectUpdate } from "../../types";
import { ProjectTimeline } from "../project-timeline";
import { useSetPageCrumb } from "../../page-crumb-context";

export function ProjectDetailView({ project, updates }: { project: Project; updates: ProjectUpdate[] }) {
  const latestStatus = updates[0]?.status ?? project.status;
  useSetPageCrumb(project.title);

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      <Link href="/dashboard/projects" className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity w-fit">
        <ArrowLeftIcon className="size-3.5" />
        All projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{project.title}</h1>
          {project.phase && <span className="text-sm text-muted-foreground">{project.phase}</span>}
        </div>
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard/messages" />}>
          <HeadphonesIcon />
          Contact support
        </Button>
      </div>

      <div className="border-t pt-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Status</span>
          <StatusPill status={latestStatus} />
        </div>

        {project.start_date && (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted-foreground">Started</span>
            <span className="text-sm font-medium tracking-tight">{fmtDate(project.start_date)}</span>
          </div>
        )}

        {project.target_date && (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted-foreground">Target</span>
            <span className="text-sm font-medium tracking-tight">{fmtDate(project.target_date)}</span>
          </div>
        )}
      </div>

      {project.notes && (
        <p className="text-[13px] text-muted-foreground leading-relaxed border-t pt-6">{project.notes}</p>
      )}

      <div className="border-t pt-6 flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Updates</h2>
        <ProjectTimeline updates={updates} />
      </div>
    </div>
  );
}
