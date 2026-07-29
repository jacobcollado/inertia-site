"use client";

import Link from "next/link";
import { ArrowLeftIcon, DownloadIcon, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPill } from "../../status-pill";
import { fmt$, fmtDate, type Invoice } from "../../types";

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export function InvoiceDetailView({ invoice }: { invoice: Invoice }) {
  const monthLabel = invoice.due_date ? monthFmt.format(new Date(invoice.due_date)) : invoice.label;

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      <Link href="/dashboard/invoices" className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity w-fit">
        <ArrowLeftIcon className="size-3.5" />
        All invoices
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {monthLabel}: {invoice.label}
          </h1>
          {invoice.due_date && (
            <span className="text-sm text-muted-foreground">
              {invoice.status === "overdue" ? "Overdue " : "Invoiced "}{fmtDate(invoice.due_date)}
            </span>
          )}
        </div>
        {invoice.payment_url && (
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={invoice.payment_url} target="_blank" rel="noreferrer" />}>
            <DownloadIcon />
            Download
          </Button>
        )}
      </div>

      <div className="border-t pt-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Total due</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold tabular-nums">{fmt$(invoice.amount)}</span>
            <StatusPill status={invoice.status} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Invoice number</span>
          <span className="text-lg font-semibold tracking-tight">{invoice.id.slice(0, 8).toUpperCase()}</span>
        </div>

        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard/messages" />}>
          <HeadphonesIcon />
          Contact support
        </Button>
      </div>

      <div className="border-t pt-6 flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Line items</h2>
        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2 text-[13px] text-muted-foreground border-b">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 items-center">
            <span className="text-sm">{invoice.label}</span>
            <span className="text-sm font-medium tabular-nums">{fmt$(invoice.amount)}</span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-t items-center">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-semibold tabular-nums">{fmt$(invoice.amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
