import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "What we've shipped, what we're building, and what's coming next.",
};

type Status = "shipped" | "in-progress" | "planned";

const STATUS_LABEL: Record<Status, string> = {
  "shipped":     "Shipped",
  "in-progress": "In progress",
  "planned":     "Planned",
};

const STATUS_COLOR: Record<Status, string> = {
  "shipped":     "rgb(var(--green))",
  "in-progress": "rgb(var(--blue))",
  "planned":     "rgb(var(--muted))",
};

const ITEMS: {
  name: string;
  detail: string;
  status: Status;
  date: string;
  href?: string;
  external?: boolean;
  progress?: number | "ongoing";
}[] = [
  {
    name: "Inertia Studio",
    detail: "Taking on client projects across Shopify, iOS, and web. Design through deployment.",
    status: "shipped",
    date: "2022",
    href: "https://www.instagram.com/by.inertia/",
    external: true,
    progress: 100,
  },
  {
    name: "Aether Theme",
    detail: "A premium Shopify theme built for conversion and craft. Licensing now available.",
    status: "in-progress",
    date: "2025",
    href: "/aether",
    progress: "ongoing",
  },
  {
    name: "Inertia Dashboard",
    detail: "A unified place for clients to track progress, access deliverables, and get support without the back-and-forth.",
    status: "in-progress",
    date: "2026",
    progress: 50,
  },
];

export default function RoadmapPage() {
  return (
    <main className="mx-3 sm:mx-auto w-auto sm:w-full max-w-[80rem] min-h-screen flex flex-col pb-16 sm:pb-20">

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-3 pt-16 sm:pt-24 pb-14 rise">
        <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-normal tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5">
          Where we're headed
        </h1>
        <p className="text-[clamp(1rem,1.8vw,1.15rem)] leading-relaxed tracking-tight text-[rgb(var(--muted))] max-w-md">
          A look at what's done, what's live, and what's next.
        </p>
      </section>

      <div className="grid-rule" aria-hidden="true" />

      {/* Timeline */}
      <div className="flex flex-col px-3">
        {ITEMS.map((item, i) => (
          <div
            key={item.name}
            className="flex gap-6 sm:gap-10 py-10 border-b border-[rgb(var(--line))] rise"
            style={{ ["--rise-delay" as any]: `${i * 80}ms`, opacity: item.status === "planned" ? 0.5 : 1 }}
          >
            {/* Left: date + status */}
            <div className="flex flex-col gap-2 w-28 sm:w-36 shrink-0 pt-0.5">
              <span className="text-[13px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.45 }}>{item.date}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: STATUS_COLOR[item.status] }}
                />
                <span className="text-[12px] tracking-tight" style={{ color: STATUS_COLOR[item.status] }}>
                  {STATUS_LABEL[item.status]}
                </span>
              </div>
            </div>

            {/* Right: content */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center gap-2">
                {item.href ? (
                  item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[clamp(1.2rem,2.5vw,1.5rem)] font-normal tracking-[-0.03em] text-[rgb(var(--fg))] hover:opacity-70 transition-opacity"
                    >
                      {item.name}
                      <span className="ml-1.5 text-[0.7em] opacity-40">↗</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-[clamp(1.2rem,2.5vw,1.5rem)] font-normal tracking-[-0.03em] text-[rgb(var(--fg))] hover:opacity-70 transition-opacity"
                    >
                      {item.name}
                      <span className="ml-1.5 text-[0.7em] opacity-40">→</span>
                    </Link>
                  )
                ) : (
                  <span className="text-[clamp(1.2rem,2.5vw,1.5rem)] font-normal tracking-[-0.03em] text-[rgb(var(--fg))]">
                    {item.name}
                  </span>
                )}
              </div>
              <p className="text-[15px] leading-relaxed tracking-tight text-[rgb(var(--muted))]">
                {item.detail}
              </p>
              {item.progress !== undefined && (
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-px bg-[rgb(var(--line))] rounded-full overflow-hidden" style={{ maxWidth: 200 }}>
                    {item.progress === "ongoing" ? (
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: "100%",
                          background: `linear-gradient(to right, ${STATUS_COLOR[item.status]}, transparent)`,
                          opacity: 0.6,
                        }}
                      />
                    ) : (
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.progress}%`,
                          background: STATUS_COLOR[item.status],
                          opacity: 0.7,
                        }}
                      />
                    )}
                  </div>
                  <span className="text-[11px] tracking-tight text-[rgb(var(--muted))]" style={{ opacity: 0.4 }}>
                    {item.progress === "ongoing" ? "Ongoing" : `${item.progress}%`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Closing */}
      <section className="flex flex-col items-center text-center px-3 py-16 sm:py-24 gap-4 rise">
        <p className="text-[15px] tracking-tight text-[rgb(var(--muted))] max-w-sm leading-relaxed">
          Have an idea or want to follow along? We'd love to hear from you.
        </p>
        <Link
          href="/contact"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch →
        </Link>
      </section>

    </main>
  );
}
