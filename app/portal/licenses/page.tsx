import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your licenses",
  description: "Manage your Aether licenses, download the latest theme files, and view your purchase history.",
};

export const revalidate = 0;

type License = {
  id: string;
  key: string;
  email: string;
  domain: string | null;
  tier: string;
  status: string;
  created_at: string;
};

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

function fmtDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active:   { bg: "rgb(var(--green) / 0.12)",  text: "rgb(var(--green))"  },
  expired:  { bg: "rgb(var(--amber) / 0.12)",  text: "rgb(var(--amber))"  },
  revoked:  { bg: "rgb(239 68 68 / 0.1)",       text: "rgb(220 38 38)"     },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.active;
  return (
    <span
      className="inline-block text-[11px] font-medium tracking-tight px-2 py-0.5 rounded-full capitalize"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="shrink-0 text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
      title="Copy to clipboard"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
        <rect x="5" y="5" width="9" height="9" rx="1.5" />
        <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2H3.5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" />
      </svg>
    </button>
  );
}

function LicenseCard({ license }: { license: License }) {
  const tierLabel = license.tier === "lifetime" ? "Lifetime" : "Standard";

  return (
    <div
      className="rounded-2xl border border-[rgb(var(--line))] p-6 flex flex-col gap-5"
      style={{ background: "rgb(var(--surface))" }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-medium tracking-tight text-[rgb(var(--fg))]">
              Aether {tierLabel}
            </span>
            <StatusBadge status={license.status} />
          </div>
          <span className="text-[12px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
            Purchased {fmtDate(license.created_at)}
          </span>
        </div>
      </div>

      {/* Key */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>License key</span>
        <div className="flex items-center gap-2">
          <code
            className="font-mono text-[14px] tracking-wide text-[rgb(var(--fg))] select-all"
          >
            {license.key}
          </code>
          {"clipboard" in navigator && <CopyButton value={license.key} />}
        </div>
      </div>

      {/* Domain */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] tracking-widest uppercase text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>Store domain</span>
        <span className="text-[14px] tracking-tight text-[rgb(var(--fg))]">
          {license.domain ? (
            <span className="font-mono">{license.domain}</span>
          ) : (
            <span className="text-[rgb(var(--muted))]" style={{ opacity: 0.5 }}>
              Not assigned yet — activates when you install the theme
            </span>
          )}
        </span>
      </div>
    </div>
  );
}

export default async function LicensesPortalPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/portal/licenses");

  const { data: licenses } = await supabase
    .from("licenses")
    .select("id, key, email, domain, tier, status, created_at")
    .eq("email", user.email!)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[88rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Back nav */}
      <div className="px-3 pt-6 pb-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-[13px] tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M13 8H3M7 4L3 8l4 4" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Header */}
      <section className="px-3 pt-10 pb-8 rise">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-3">
          Your licenses
        </h1>
        <p className="text-[14px] tracking-tight leading-relaxed text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
          {user.email}
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Content */}
      <div className="px-3 py-10 sm:py-12 w-full max-w-2xl mx-auto rise" style={{ ["--rise-delay" as any]: "40ms" }}>
        {!licenses || licenses.length === 0 ? (
          <div className="flex flex-col gap-4 text-center py-12">
            <p className="text-[15px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.6 }}>
              No licenses yet.
            </p>
            <Link
              href="/aether/buy"
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-medium tracking-tight text-[rgb(var(--bg))] self-center transition-opacity hover:opacity-85"
              style={{ background: "var(--accent-gradient)" }}
            >
              Get Aether
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {licenses.map((l) => (
              <LicenseCard key={l.id} license={l} />
            ))}
          </div>
        )}
      </div>

    </main>
  );
}
