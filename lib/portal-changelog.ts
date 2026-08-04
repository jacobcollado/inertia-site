export type PortalNoteType = "added" | "improved" | "fixed" | "removed";

export type PortalChangelogEntry = {
  date: string;
  type: PortalNoteType;
  title: string;
  detail?: string;
};

export const PORTAL_CHANGELOG: PortalChangelogEntry[] = [
  {
    date: "2026-08-04",
    type: "added",
    title: "Changelog tab",
    detail: "See what's new in the portal without digging through email or asking us.",
  },
  {
    date: "2026-08-04",
    type: "improved",
    title: "Support badge accuracy",
    detail: "The sidebar and overview now count open cases waiting on you, not just unread messages.",
  },
  {
    date: "2026-08-04",
    type: "improved",
    title: "Overdue invoice pay flow",
    detail: "Overdue invoices show Pay actions on the detail page so nothing gets missed.",
  },
  {
    date: "2026-08-04",
    type: "improved",
    title: "Login screen polish",
    detail: "Refined card depth, side shadows, and terms placement on the sign-in page.",
  },
  {
    date: "2026-06-01",
    type: "added",
    title: "Support cases",
    detail: "Open a case, track status, and keep conversation history in one thread.",
  },
  {
    date: "2026-06-01",
    type: "added",
    title: "AI-assisted replies",
    detail: "Get quick answers from our agent; request a human anytime.",
  },
  {
    date: "2026-02-01",
    type: "added",
    title: "Project tracking",
    detail: "Follow phase updates and notes as work progresses.",
  },
  {
    date: "2026-02-01",
    type: "added",
    title: "Invoices & payments",
    detail: "View outstanding balances and pay directly from the portal.",
  },
  {
    date: "2026-02-01",
    type: "added",
    title: "Shared files",
    detail: "Download deliverables and assets we've shared with you.",
  },
  {
    date: "2026-02-01",
    type: "added",
    title: "License downloads",
    detail: "Aether license holders can grab the latest theme build anytime.",
  },
];

export function formatChangelogDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
