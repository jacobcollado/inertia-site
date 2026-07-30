"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedFileUrl } from "../../actions";
import { StatusPill } from "../../status-pill";
import { fmtDate, type License } from "../../types";
import { useSetPageCrumb } from "../../page-crumb-context";

function ThemeDownloadButton({ path }: { path: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const { url, error } = await getSignedFileUrl(path);
      if (error || !url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = "aether-theme.zip";
      a.click();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      {loading ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
      {loading ? "Preparing…" : "Download theme"}
    </Button>
  );
}

export function LicenseDetailView({ license }: { license: License }) {
  const [copied, setCopied] = useState(false);
  const tierLabel = license.tier === "lifetime" ? "Forever" : "Core";
  useSetPageCrumb(license.key);

  const copy = () => {
    navigator.clipboard.writeText(license.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      <Link href="/dashboard/licenses" className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity w-fit">
        <ArrowLeftIcon className="size-3.5" />
        All licenses
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Aether {tierLabel}</h1>
          <span className="text-sm text-muted-foreground">Purchased {fmtDate(license.created_at)}</span>
        </div>
        {license.theme_file_path && <ThemeDownloadButton path={license.theme_file_path} />}
      </div>

      <div className="border-t pt-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Status</span>
          <StatusPill status={license.status} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Store domain</span>
          <span className="text-sm font-medium tracking-tight">{license.domain ?? "Not assigned yet"}</span>
        </div>
      </div>

      <div className="border-t pt-6 flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">License key</span>
        <div className="flex items-center gap-2 rounded-md border bg-sidebar px-4 py-3">
          <code className="font-mono text-sm tracking-wide select-all truncate flex-1">{license.key}</code>
          <Button variant="ghost" size="icon-sm" onClick={copy} title="Copy" className="shrink-0">
            {copied ? <CheckIcon className="text-[#2E873F]" /> : <CopyIcon />}
          </Button>
        </div>
      </div>
    </div>
  );
}
