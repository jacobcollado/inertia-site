"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DownloadIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { getSignedFileUrl } from "./actions";
import type { License } from "./types";
import { LATEST_AETHER_VERSION, downloadedThemeVersion, releasesSince } from "@/lib/aether-changelog";

const DISMISSED_UPDATE_KEY = "dashboard-update-dismissed";

/* Onboarding nudge for a license that hasn't finished setup.
 *
 * Two states, in the order the work actually happens: download the theme, then
 * activate it on a store. A license is activated when the Shopify app calls
 * /api/activate-license, which stamps the domain, so `domain` is the real
 * marker rather than anything the portal sets.
 *
 * Nothing renders once a license has both, and a buyer with several licenses
 * only ever sees the furthest-behind one: three stacked banners would read as
 * an error state rather than a prompt.
 *
 * Once setup is done, the same slot announces a newer theme release than the
 * one they last downloaded. That one can be dismissed, per version, since
 * updating is their call; the license page keeps showing it regardless.
 */
export function SetupBanner({ licenses }: { licenses: License[] }) {
  const [loading, setLoading] = useState(false);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      setDismissedVersion(localStorage.getItem(DISMISSED_UPDATE_KEY));
    } catch {}
  }, []);

  const active = licenses.filter((l) => l.status === "active");
  // Never downloaded outranks downloaded-but-not-activated, since that buyer
  // hasn't started at all.
  const pending =
    active.find((l) => !l.downloaded_at) ?? active.find((l) => !l.domain);
  const outdated = pending
    ? undefined
    : active.find((l) => releasesSince(l).length > 0 && dismissedVersion !== LATEST_AETHER_VERSION);

  const target = pending ?? outdated;
  if (!target) return null;

  const needsDownload = !!pending && !pending.downloaded_at;

  const download = async () => {
    if (!target.theme_file_path || loading) return;
    setLoading(true);
    try {
      const { url, error } = await getSignedFileUrl(target.theme_file_path);
      if (error || !url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = "aether-theme.zip";
      a.click();
      // The action stamped downloaded_at and revalidated the cache, but this
      // view is already rendered. Refresh pulls the new server data so the
      // banner moves to the activation step without a manual reload.
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const dismissUpdate = () => {
    setDismissedVersion(LATEST_AETHER_VERSION);
    try {
      localStorage.setItem(DISMISSED_UPDATE_KEY, LATEST_AETHER_VERSION);
    } catch {}
  };

  if (outdated) {
    return (
      <div className="rounded-sm border bg-sidebar px-4 py-3.5 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-start gap-3">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Aether v{LATEST_AETHER_VERSION} is available</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                You&rsquo;re on v{downloadedThemeVersion(outdated)}. Download the update, then upload it to Shopify like before.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 pl-5 sm:pl-0">
            {outdated.theme_file_path && (
              <Button size="sm" onClick={download} disabled={loading}>
                {loading ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
                {loading ? "Preparing…" : "Download update"}
              </Button>
            )}
            <Link href="/dashboard/changelog" className={buttonVariants({ variant: "outline", size: "sm" })}>
              What&rsquo;s new
            </Link>
            <Button variant="ghost" size="icon-sm" onClick={dismissUpdate} aria-label="Dismiss">
              <XIcon />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border bg-sidebar px-4 py-3.5 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex items-start gap-3">
          {/* Amber rather than red: this is an unfinished step, not a fault. */}
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {needsDownload ? "Download Aether to get started" : "Your license isn't active yet"}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {needsDownload
                ? "Your theme is ready. Download it, then upload the zip to your Shopify store."
                : `Enter ${target.key} in Theme Settings, License Key to activate it on your store.`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 pl-5 sm:pl-0">
          {needsDownload && target.theme_file_path ? (
            <Button size="sm" onClick={download} disabled={loading}>
              {loading ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
              {loading ? "Preparing…" : "Download theme"}
            </Button>
          ) : null}
          {/* Styled as a button but rendered as a Link: this Button doesn't
              support asChild, and a nested <button><a> would be invalid. */}
          <Link
            href="/aether/docs"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Installation guide
          </Link>
        </div>
      </div>
    </div>
  );
}
