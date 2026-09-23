"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckIcon, CopyIcon, DownloadIcon, ExternalLinkIcon, LoaderCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedFileUrl } from "../../actions";
import { StatusPill } from "../../status-pill";
import { fmtDate, type License } from "../../types";
import { useSetPageCrumb } from "../../page-crumb-context";
import { downloadedThemeVersion, releasesSince } from "@/lib/aether-changelog";

/* Stripe reports the currency per session, so this formats from that rather
 * than the USD-fixed fmt$ helper. Zero-decimal currencies (JPY and friends)
 * aren't divided by 100. */
function fmtAmount(amount: number, currency: string) {
  const code = currency.toUpperCase();
  const zeroDecimal = new Set(["JPY", "KRW", "VND", "CLP", "ISK"]);
  const value = zeroDecimal.has(code) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(value);
  } catch {
    return `${value.toFixed(2)} ${code}`;
  }
}

function ThemeDownloadButton({ path, label = "Download theme" }: { path: string; label?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    try {
      const { url, error } = await getSignedFileUrl(path);
      if (error || !url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = "aether-theme.zip";
      a.click();
      // The download recorded the new version server side; refresh so the
      // update notice clears without a reload.
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="download-theme-shimmer relative isolate overflow-hidden"
    >
      <span className="relative z-[1] inline-flex items-center gap-1">
        {loading ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
        {loading ? "Preparing…" : label}
      </span>
    </Button>
  );
}

export function LicenseDetailView({ license }: { license: License }) {
  const [copied, setCopied] = useState(false);
  const tierLabel = license.tier === "lifetime" ? "Forever" : "Core";
  const newer = license.status === "active" ? releasesSince(license) : [];
  const current = downloadedThemeVersion(license);
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

      {newer.length > 0 && (
        <div className="flex flex-col gap-3 rounded-sm border bg-sidebar px-4 py-3.5 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium">Aether v{newer[0].version} is available</p>
              <p className="text-sm text-muted-foreground">
                You have v{current}.{" "}
                {newer.length > 1 && `${newer.length} releases since then. `}
                {newer[0].summary}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pl-5">
            {license.theme_file_path && <ThemeDownloadButton path={license.theme_file_path} label="Download update" />}
            <Link href="/dashboard/changelog" className="text-sm font-medium text-primary hover:opacity-80 transition-opacity">
              What&rsquo;s new
            </Link>
          </div>
        </div>
      )}

      <div className="border-t pt-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Status</span>
          <StatusPill status={license.status} />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Store domain</span>
          <span className="text-sm font-medium tracking-tight">{license.domain ?? "Not assigned yet"}</span>
        </div>

        {current && (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted-foreground">Your version</span>
            <span className="text-sm font-medium tabular-nums tracking-tight">v{current}</span>
          </div>
        )}
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

      {/* Purchases made before receipt capture shipped have no amount, and a
          license issued by hand has none either, so the whole block is
          conditional rather than rendering empty rows. */}
      {(license.amount_total !== null || license.receipt_url) && (
        <div className="border-t pt-6 flex flex-col gap-4">
          <span className="text-[13px] text-muted-foreground">Purchase</span>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            {license.amount_total !== null && (
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">Amount</span>
                <span className="text-sm font-medium tracking-tight">
                  {fmtAmount(license.amount_total, license.currency ?? "usd")}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[13px] text-muted-foreground">Paid</span>
              <span className="text-sm font-medium tracking-tight">
                {fmtDate(license.paid_at ?? license.created_at)}
              </span>
            </div>

            {license.receipt_url && (
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">Receipt</span>
                <a
                  href={license.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium tracking-tight text-primary hover:opacity-80 transition-opacity"
                >
                  View receipt
                  <ExternalLinkIcon className="size-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
