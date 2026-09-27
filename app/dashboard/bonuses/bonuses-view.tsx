import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, GiftIcon, ListIcon } from "lucide-react";
import type { BonusMeta } from "@/lib/bonuses";

export function BonusesView({ bonuses, unlocked }: { bonuses: BonusMeta[]; unlocked: boolean }) {
  const total = bonuses.reduce((sum, b) => sum + b.worth, 0);

  if (!unlocked) {
    return (
      <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <GiftIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">Bonuses come with Aether</p>
            <p className="text-[13px] text-muted-foreground">
              ${total} in guides and trusted contacts, included with every Aether license.
            </p>
          </div>
          <Link href="/aether" className="text-[13px] font-medium text-primary hover:underline">
            See Aether
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <div className="rounded-md border bg-sidebar px-4 py-4 sm:rounded-sm sm:px-5">
        <p className="text-[15px] font-medium tracking-tight">Your bonuses</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          ${total} in guides and trusted contacts, included with your license. We keep them up to date, so check back.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {bonuses.map((b) => {
          const Icon = b.kind === "guide" ? BookOpenIcon : ListIcon;
          return (
            <li key={b.slug}>
              <Link
                href={`/dashboard/bonuses/${b.slug}`}
                className="group flex h-full flex-col rounded-md border bg-sidebar px-4 py-4 transition-colors hover:bg-sidebar-accent/40 sm:rounded-sm sm:px-5"
              >
                <span className="flex items-center justify-between gap-3 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="size-3.5" />
                    {b.kind === "guide" ? "Guide" : "List"}
                  </span>
                  <span className="tabular-nums">Worth ${b.worth}</span>
                </span>
                <span className="mt-3 text-[15px] font-medium tracking-tight">{b.title}</span>
                <span className="mt-1 text-[13px] leading-snug text-muted-foreground">{b.summary}</span>
                <span className="mt-auto flex justify-end pt-4 text-muted-foreground transition-colors group-hover:text-foreground">
                  <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
