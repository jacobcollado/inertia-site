"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRightIcon, MoreHorizontalIcon, ChevronDownIcon, ReceiptIcon } from "lucide-react";
import { WhopCheckoutModal } from "./whop-checkout-modal";
import { StatusPill } from "../status-pill";
import { fmt$, fmtDate, type Invoice } from "../types";

const monthFmt = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

const FILTERS = [
  { value: "all", label: "All invoices" },
  { value: "paid", label: "Paid invoices" },
  { value: "open", label: "Open invoices" },
] as const;

type FilterValue = (typeof FILTERS)[number]["value"];

export function InvoicesView({ invoices, clientEmail }: { invoices: Invoice[]; clientEmail: string }) {
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");

  const filteredInvoices = invoices.filter(inv => {
    if (filter === "paid") return inv.status === "paid";
    if (filter === "open") return inv.status !== "paid" && inv.status !== "draft";
    return true;
  });

  const filterLabel = FILTERS.find(f => f.value === filter)?.label ?? "All invoices";

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center justify-between gap-2 w-full rounded-md border bg-sidebar px-4 py-2 text-sm font-medium tracking-tight hover:bg-sidebar-accent/40 transition-colors"
            />
          }
        >
          {filterLabel}
          <ChevronDownIcon className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-56">
          {FILTERS.map(f => (
            <DropdownMenuItem key={f.value} onClick={() => setFilter(f.value)}>
              {f.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ReceiptIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">
              {filter === "all" ? "No invoices yet" : "No matching invoices"}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {filter === "all" ? "Invoices from us will show up here when they're issued." : "Try a different filter to see other invoices."}
            </p>
          </div>
          {filter === "all" && (
            <Button variant="outline" size="sm" className="mt-1" nativeButton={false} render={<Link href="/dashboard/messages/new" />}>
              Ask about billing
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {filteredInvoices.map((inv, i) => {
            const unpaid = inv.status !== "paid" && inv.status !== "draft";
            const monthLabel = inv.due_date ? monthFmt.format(new Date(inv.due_date)) : inv.label;
            return (
              <div
                key={inv.id}
                className={`rounded-md border bg-sidebar px-5 py-4 sm:rounded-none sm:border-0 sm:border-b ${i === filteredInvoices.length - 1 ? "sm:border-b-0" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[15px] font-medium tracking-tight truncate">{monthLabel}</span>
                      {inv.payment_url && unpaid ? (
                        inv.payment_url.startsWith("http") ? (
                          <Badge
                            variant="outline"
                            className="cursor-pointer border-transparent text-primary gap-0.5 shrink-0"
                            style={{ backgroundColor: "color-mix(in srgb, var(--sh-primary) 15%, transparent)" }}
                            render={<a href={inv.payment_url} target="_blank" rel="noreferrer" />}
                          >
                            Pay
                            <ArrowUpRightIcon className="!size-2.5" />
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="cursor-pointer border-transparent text-primary shrink-0"
                            style={{ backgroundColor: "color-mix(in srgb, var(--sh-primary) 15%, transparent)" }}
                            render={<button type="button" onClick={() => setCheckoutPlanId(inv.payment_url)} />}
                          >
                            Pay
                          </Badge>
                        )
                      ) : (
                        <StatusPill status={inv.status} />
                      )}
                    </div>
                    {inv.due_date && (
                      <span className="text-[13px] text-muted-foreground truncate">{inv.label}</span>
                    )}
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-center">
                    <span className="text-[13px] text-muted-foreground">Total due</span>
                    <span className="text-[15px] font-semibold tabular-nums">{fmt$(inv.amount)}</span>
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-end pr-6">
                    <span className={`text-[13px] ${inv.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                      {inv.due_date
                        ? `${inv.status === "overdue" ? "Overdue " : "Invoiced "}${fmtDate(inv.due_date)}`
                        : "No due date"}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="shrink-0" />}>
                      <MoreHorizontalIcon />
                      <span className="sr-only">Invoice actions</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-44">
                      <DropdownMenuItem className="py-2" render={<Link href={`/dashboard/invoices/${inv.id}`} />}>
                        View invoice
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled className="py-2">
                        Download PDF
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="sm:hidden border-t mt-3 pt-3 flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">Total due</span>
                    <span className="text-[15px] font-semibold tabular-nums">{fmt$(inv.amount)}</span>
                  </div>
                  <span className={`text-[13px] ${inv.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                    {inv.due_date
                      ? `${inv.status === "overdue" ? "Overdue " : "Invoiced "}${fmtDate(inv.due_date)}`
                      : "No due date"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkoutPlanId && (
        <WhopCheckoutModal planId={checkoutPlanId} clientEmail={clientEmail} onClose={() => setCheckoutPlanId(null)} />
      )}
    </div>
  );
}
