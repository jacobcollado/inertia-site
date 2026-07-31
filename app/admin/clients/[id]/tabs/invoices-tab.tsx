"use client";

import { useState, useTransition } from "react";
import { PlusIcon, TrashIcon, ReceiptIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoice, updateInvoiceStatus, deleteInvoice } from "../../../actions";
import { fmt$, fmtDate, type Invoice } from "../types";

const INVOICE_STATUSES = ["draft", "pending", "paid", "overdue"] as const;

function AddInvoiceDialog({ clientId, open, onOpenChange }: { clientId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createInvoice(clientId, fd);
      if (res.error) { setError(res.error); return; }
      onOpenChange(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add invoice</DialogTitle>
          <DialogDescription>Create a new invoice for this client.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="label">Label</Label>
            <Input id="label" name="label" required placeholder="Invoice label" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Amount (USD)</Label>
            <Input id="amount" name="amount" type="number" required placeholder="0.00" step="0.01" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="due_date">Due date</Label>
            <Input id="due_date" name="due_date" type="date" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="payment_url">Payment link</Label>
            <Input id="payment_url" name="payment_url" type="url" placeholder="Optional" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="pending">
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map(s => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-[13px] text-destructive tracking-tight">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InvoicesTab({ clientId, invoices }: { clientId: string; invoices: Invoice[] }) {
  const [data, setData] = useState(invoices);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const onStatusChange = (invoiceId: string, status: string) => {
    setData(prev => prev.map(i => i.id === invoiceId ? { ...i, status } : i));
    startTransition(async () => {
      await updateInvoiceStatus(invoiceId, clientId, status);
    });
  };

  const onDelete = (invoiceId: string) => {
    startTransition(async () => {
      await deleteInvoice(invoiceId, clientId);
      setData(prev => prev.filter(i => i.id !== invoiceId));
    });
  };

  const totalOwed = data.filter(i => i.status !== "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Invoices</h2>
          {totalOwed > 0 && <p className="text-[13px] tracking-tight mt-0.5 text-amber-600 dark:text-amber-400">{fmt$(totalOwed)} outstanding</p>}
        </div>
        <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
          <PlusIcon />
          Add invoice
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border bg-sidebar px-6 py-14 text-center sm:rounded-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ReceiptIcon className="size-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[15px] font-medium tracking-tight">No invoices yet</p>
            <p className="text-[13px] text-muted-foreground">Add one to start billing this client.</p>
          </div>
          <Button variant="outline" size="sm" className="mt-1" onClick={() => setAdding(true)}>
            <PlusIcon />
            Add invoice
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:gap-0 sm:rounded-sm sm:border sm:bg-sidebar sm:overflow-hidden">
          {data.map((inv, i) => {
            const overdue = inv.status === "overdue";
            return (
              <div
                key={inv.id}
                className={`rounded-md border bg-sidebar px-5 py-4 sm:rounded-none sm:border-0 sm:border-b ${i === data.length - 1 ? "sm:border-b-0" : ""} ${overdue ? "sm:bg-destructive/5" : ""}`}
              >
                <div className="flex items-center justify-between gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr_auto] sm:items-center sm:gap-4">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[15px] font-medium tracking-tight truncate">{inv.label}</span>
                    {inv.paid_at
                      ? <span className="text-[13px] text-muted-foreground truncate">Paid {fmtDate(inv.paid_at)}</span>
                      : inv.due_date
                        ? <span className={`text-[13px] truncate ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
                            {overdue ? "Overdue " : "Due "}{fmtDate(inv.due_date)}
                          </span>
                        : null}
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-center">
                    <span className="text-[13px] text-muted-foreground">Status</span>
                    <Select value={inv.status} onValueChange={(v) => v && onStatusChange(inv.id, v)}>
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {INVOICE_STATUSES.map(s => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="hidden sm:flex flex-col gap-1 items-end pr-6">
                    <span className="text-[13px] text-muted-foreground">Amount</span>
                    <span className="text-[15px] font-semibold tabular-nums">{fmt$(inv.amount)}</span>
                  </div>

                  <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground hover:text-destructive" disabled={pending} onClick={() => onDelete(inv.id)}>
                    <TrashIcon />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>

                <div className="sm:hidden border-t mt-3 pt-3 flex items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] text-muted-foreground">Amount</span>
                    <span className="text-[15px] font-semibold tabular-nums">{fmt$(inv.amount)}</span>
                  </div>
                  <Select value={inv.status} onValueChange={(v) => v && onStatusChange(inv.id, v)}>
                    <SelectTrigger size="sm" className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INVOICE_STATUSES.map(s => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddInvoiceDialog clientId={clientId} open={adding} onOpenChange={setAdding} />
    </div>
  );
}
