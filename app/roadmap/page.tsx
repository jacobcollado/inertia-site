import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Roadmap — Inertia",
  description: "What we've shipped, what we're building, and what's next.",
};

type Status = "shipped" | "in-progress" | "planned";

type RoadmapItem = {
  name: string;
  description: string;
  detail: string;
  status: Status;
  date: string;
  href?: string;
  external?: boolean;
};

const ITEMS: RoadmapItem[] = [
  {
    name: "Inertia Studio",
    description: "Client work — storefronts, apps, and brand.",
    detail: "Taking on client projects across Shopify, iOS, and web. Design through deployment.",
    status: "shipped",
    date: "2022",
    href: "https://www.instagram.com/by.inertia/",
    external: true,
  },
  {
    name: "Aether Theme",
    description: "High-end Shopify theme for modern brands.",
    detail: "A premium Shopify theme built for conversion and craft. Licensing now available.",
    status: "in-progress",
    date: "2025",
    href: "/aether",
  },
  {
    name: "Inertia Dashboard",
    description: "Client portal for projects, files, and support.",
    detail: "A unified place for clients to track progress, access deliverables, and get support without the back-and-forth.",
    status: "planned",
    date: "2026",
  },
];

const STATUS_LABEL: Record<Status, string> = {
  "shipped": "Shipped",
  "in-progress": "In progress",
  "planned": "Planned",
};

const STATUS_COLOR: Record<Status, string> = {
  "shipped": "var(--green)",
  "in-progress": "var(--blue)",
  "planned": "var(--muted)",
};

function GridRule() {
  return <div className="grid-rule" aria-hidden="true" />;
}

export default function RoadmapPage() {
  return (
    <main className="page-container mx-auto w-full max-w-5xl min-h-screen flex flex-col">

      {/* Nav */}
      <div className="px-6 sm:px-8 py-5 rise">
        <Link href="/" className="text-sm tracking-tight text-[rgb(var(--muted))] hover:text-[rgb(var(--fg))] transition-colors">
          ← Home
        </Link>
      </div>

      <GridRule />

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 sm:px-8 pt-14 pb-12 rise">
        <h1 className="text-[clamp(2.4rem,7vw,5rem)] font-medium tracking-[-0.04em] leading-none text-[rgb(var(--fg))] mb-5">
          Roadmap
        </h1>
        <p className="text-[1rem] leading-[1.7] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          What we've shipped, what we're actively building, and what's coming next.
        </p>
      </section>

      <GridRule />

      {/* Items */}
      {ITEMS.map((item, i) => {
        const color = `rgb(${STATUS_COLOR[item.status]})`;
        const isExternal = item.external;

        const nameEl = item.href ? (
          isExternal ? (
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none hover:text-[rgb(var(--muted))] transition-colors w-fit"
            >
              {item.name} ↗
            </a>
          ) : (
            <Link
              href={item.href}
              className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none hover:text-[rgb(var(--muted))] transition-colors w-fit"
            >
              {item.name} →
            </Link>
          )
        ) : (
          <span className="text-[20px] sm:text-[22px] font-medium tracking-tight text-[rgb(var(--fg))] leading-none">
            {item.name}
          </span>
        );

        return (
          <div key={item.name}>
            <div
              className="flex flex-col sm:flex-row sm:items-start gap-6 px-6 sm:px-8 py-8 rise"
              style={{ ["--rise-delay" as any]: `${i * 80}ms` }}
            >
              {/* Left: status + date */}
              <div className="flex sm:flex-col gap-3 sm:gap-1.5 sm:w-32 shrink-0 pt-0.5">
                <span className="text-[13px] tracking-tight font-medium" style={{ color }}>
                  {STATUS_LABEL[item.status]}
                </span>
                <span className="text-[13px] tracking-tight text-[rgb(var(--muted))] opacity-50">
                  {item.date}
                </span>
              </div>

              {/* Divider dot — desktop only */}
              <div className="hidden sm:flex flex-col items-center pt-1.5 gap-0">
                <div
                  className="w-[10px] h-[10px] rounded-full shrink-0 border-[1.5px]"
                  style={{
                    borderColor: color,
                    background: item.status === "shipped" ? color : "rgb(var(--bg))",
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* Right: content */}
              <div className="flex flex-col gap-1.5 flex-1">
                {nameEl}
                <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] leading-relaxed max-w-md">
                  {item.detail}
                </p>
              </div>
            </div>
            <GridRule />
          </div>
        );
      })}

      {/* Footer note */}
      <div className="flex flex-col items-center text-center px-6 sm:px-8 py-12 gap-3 rise">
        <p className="text-[13px] tracking-tight text-[rgb(var(--muted))] max-w-sm">
          Have an idea or want to follow along? We'd love to hear from you.
        </p>
        <Link
          href="/contact"
          className="text-[13px] tracking-tight text-[rgb(var(--fg))] hover:text-[rgb(var(--muted))] transition-colors"
        >
          Get in touch →
        </Link>
      </div>

      <GridRule />

    </main>
  );
}
