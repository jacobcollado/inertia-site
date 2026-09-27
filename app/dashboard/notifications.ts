import { LATEST_AETHER_VERSION, releasesSince } from "@/lib/aether-changelog";
import type { License } from "./types";

/* What the client still has to see or do, for the bell in the mobile topbar.
 *
 * Every entry is derived from state, not stored: it disappears on its own
 * once the thing is done (theme downloaded, invoice paid, reply sent). The
 * one exception is the bonuses, which have no natural "done" state, so they
 * clear once the account has opened the bonuses page (bonuses_seen in the
 * user's metadata, set by MarkBonusesSeen).
 *
 * Order is priority: money and blockers first, nice-to-haves last. */

export type Notice = { id: string; title: string; detail: string; href: string };

export function buildNotices({
  licenses,
  unpaidInvoices,
  casesNeedingResponse,
  bonusesSeen,
}: {
  licenses: Pick<License, "id" | "status" | "domain" | "downloaded_at" | "downloaded_version">[];
  unpaidInvoices: { id: string; label: string; status: string }[];
  casesNeedingResponse: number;
  bonusesSeen: boolean;
}): Notice[] {
  const notices: Notice[] = [];
  const active = licenses.filter((l) => l.status === "active");

  const overdue = unpaidInvoices.filter((i) => i.status === "overdue");
  if (unpaidInvoices.length > 0) {
    notices.push({
      id: "invoices",
      title: overdue.length > 0 ? "Invoice overdue" : "Invoice due",
      detail:
        unpaidInvoices.length === 1
          ? unpaidInvoices[0].label
          : `${unpaidInvoices.length} invoices waiting for payment`,
      href: unpaidInvoices.length === 1 ? `/dashboard/invoices/${unpaidInvoices[0].id}` : "/dashboard/invoices",
    });
  }

  if (casesNeedingResponse > 0) {
    notices.push({
      id: "support",
      title: casesNeedingResponse === 1 ? "New support reply" : `${casesNeedingResponse} new support replies`,
      detail: "We replied to your case.",
      href: "/dashboard/support",
    });
  }

  // Same precedence as the overview's setup banner: never downloaded first,
  // then downloaded but not activated on a store.
  const notDownloaded = active.find((l) => !l.downloaded_at);
  const notActivated = active.find((l) => l.downloaded_at && !l.domain);
  if (notDownloaded) {
    notices.push({
      id: "download",
      title: "Download Aether",
      detail: "Your theme is ready to download.",
      href: `/dashboard/licenses/${notDownloaded.id}`,
    });
  } else if (notActivated) {
    notices.push({
      id: "activate",
      title: "Activate your license",
      detail: "Add your key in the theme editor to unlock Aether.",
      href: `/dashboard/licenses/${notActivated.id}`,
    });
  }

  const outdated = active.find((l) => l.domain && releasesSince(l).length > 0);
  if (outdated) {
    notices.push({
      id: `update-${LATEST_AETHER_VERSION}`,
      title: "Aether update available",
      detail: `Version ${LATEST_AETHER_VERSION} is ready.`,
      href: `/dashboard/licenses/${outdated.id}`,
    });
  }

  if (active.length > 0 && !bonusesSeen) {
    notices.push({
      id: "bonuses",
      title: "Your bonuses are ready",
      detail: "Guides and trusted contacts, included with your license.",
      href: "/dashboard/bonuses",
    });
  }

  return notices;
}
