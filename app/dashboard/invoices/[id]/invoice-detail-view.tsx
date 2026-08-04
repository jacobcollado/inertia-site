"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon, HeadphonesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StatusPill } from "../../status-pill";
import { fmt$, fmtDate, type Invoice } from "../../types";
import { useSetPageCrumb } from "../../page-crumb-context";
import { WhopCheckoutModal } from "../whop-checkout-modal";

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function PayButton({
  invoice,
  onCheckout,
  size = "sm",
  className,
  urgent = false,
}: {
  invoice: Invoice;
  onCheckout: (planId: string) => void;
  size?: "sm" | "default";
  className?: string;
  urgent?: boolean;
}) {
  const label = `Pay ${fmt$(invoice.amount)}`;
  const buttonClass = cn(
    "border-0 text-primary bg-[color-mix(in_srgb,var(--sh-primary)_15%,transparent)] hover:bg-[color-mix(in_srgb,var(--sh-primary)_25%,transparent)] hover:text-primary",
    urgent && "gap-0.5",
    className,
  );

  if (invoice.payment_url!.startsWith("http")) {
    return (
      <Button
        variant="outline"
        size={size}
        className={buttonClass}
        nativeButton={false}
        render={<a href={invoice.payment_url!} target="_blank" rel="noreferrer" />}
      >
        {label}
        {urgent && <ArrowUpRightIcon />}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={buttonClass}
      onClick={() => onCheckout(invoice.payment_url!)}
    >
      {label}
      {urgent && <ArrowUpRightIcon />}
    </Button>
  );
}

export function InvoiceDetailView({ invoice, clientEmail }: { invoice: Invoice; clientEmail: string }) {
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const monthLabel = invoice.due_date ? monthFmt.format(new Date(invoice.due_date)) : invoice.label;
  const unpaid = invoice.status !== "paid" && invoice.status !== "draft";
  const isOverdue = invoice.status === "overdue";
  const canPay = unpaid && !!invoice.payment_url;

  useSetPageCrumb(`#${invoice.id.slice(0, 8).toUpperCase()}`);

  return (
    <div className="flex flex-col gap-6 w-full lg:max-w-[58%] mx-auto">
      <Link href="/dashboard/invoices" className="flex items-center gap-1.5 text-sm text-primary hover:opacity-80 transition-opacity w-fit">
        <ArrowLeftIcon className="size-3.5" />
        All invoices
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            {monthLabel}: {invoice.label}
          </h1>
          {invoice.due_date && (
            <span className={`text-sm ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
              {isOverdue ? "Overdue " : "Invoiced "}{fmtDate(invoice.due_date)}
            </span>
          )}
        </div>
        {canPay && (
          <PayButton invoice={invoice} onCheckout={setCheckoutPlanId} urgent={isOverdue} className="shrink-0" />
        )}
      </div>

      {isOverdue && canPay && (
        <div className="flex flex-col gap-3 rounded-md border border-destructive/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between" style={{ backgroundColor: "color-mix(in srgb, var(--sh-destructive) 10%, transparent)" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-destructive">Payment overdue</span>
            <span className="text-[13px] text-muted-foreground">
              This invoice was due {fmtDate(invoice.due_date)}. Pay {fmt$(invoice.amount)} to bring your account current.
            </span>
          </div>
          <PayButton
            invoice={invoice}
            onCheckout={setCheckoutPlanId}
            urgent
            className="w-full shrink-0 sm:w-auto"
          />
        </div>
      )}

      <div className="border-t pt-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Total due</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-semibold tabular-nums">{fmt$(invoice.amount)}</span>
            <StatusPill status={invoice.status} />
            {canPay && !isOverdue && (
              <PayButton invoice={invoice} onCheckout={setCheckoutPlanId} className="sm:hidden" />
            )}
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

      {checkoutPlanId && (
        <WhopCheckoutModal planId={checkoutPlanId} clientEmail={clientEmail} onClose={() => setCheckoutPlanId(null)} />
      )}
    </div>
  );
}
