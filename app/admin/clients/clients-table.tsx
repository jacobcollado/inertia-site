"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  EllipsisVerticalIcon,
  LayoutGridIcon,
  PlusIcon,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { inviteClient, deleteAccount, suspendAccount, unsuspendAccount } from "../actions";
import type { Client } from "../data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function InviteForm({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await inviteClient(fd);
      if (res.error) { setError(res.error); return; }
      onDone();
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      {[
        { name: "email", type: "email", placeholder: "Client email", required: true },
        { name: "name", type: "text", placeholder: "Name (optional)" },
        { name: "company", type: "text", placeholder: "Company (optional)" },
      ].map(f => (
        <div key={f.name} className="px-5 py-4 border-t border-sidebar-border">
          <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder}
            className="w-full bg-transparent text-[15px] tracking-tight text-foreground placeholder:text-muted-foreground focus:outline-none" />
        </div>
      ))}
      {error && <p className="px-5 pt-2 text-[13px] text-destructive tracking-tight">{error}</p>}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-sidebar-border">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? "Sending..." : "Send invite"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function StatusBadge({ client }: { client: Client }) {
  if (client.banned) {
    return <Badge variant="outline" className="border-transparent bg-destructive/15 text-destructive">Suspended</Badge>;
  }
  if (!client.confirmed_at) {
    return <Badge variant="outline" className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">Pending</Badge>;
  }
  return <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Active</Badge>;
}

function RowActions({ client, onDeleted }: { client: Client; onDeleted: (id: string) => void }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const onToggleSuspend = () => {
    startTransition(async () => {
      if (client.banned) await unsuspendAccount(client.id);
      else await suspendAccount(client.id);
      router.refresh();
    });
  };

  const onDelete = () => {
    startTransition(async () => {
      await deleteAccount(client.id);
      onDeleted(client.id);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground data-[state=open]:bg-muted" disabled={pending} />
        }
      >
        <EllipsisVerticalIcon />
        <span className="sr-only">Open menu</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => router.push(`/admin/clients/${client.id}`)}>View details</DropdownMenuItem>
        <DropdownMenuItem onClick={onToggleSuspend}>{client.banned ? "Unsuspend" : "Suspend"}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildColumns(onDeleted: (id: string) => void): ColumnDef<Client>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "client",
      accessorFn: (c) => c.company ?? c.name ?? c.email,
      header: "Client",
      cell: ({ row }) => {
        const c = row.original;
        const displayName = c.company ?? c.name ?? c.email;
        const initials = (c.name ?? c.email).slice(0, 2).toUpperCase();
        return (
          <Link href={`/admin/clients/${c.id}`} className="flex items-center gap-3 min-w-0 hover:opacity-75 transition-opacity">
            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[11px] font-medium tracking-tight text-muted-foreground bg-sidebar-accent">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-medium tracking-tight text-foreground truncate leading-snug">{displayName}</span>
              <span className="text-[12px] tracking-tight text-muted-foreground truncate">{c.email}</span>
            </div>
          </Link>
        );
      },
      enableHiding: false,
    },
    {
      id: "status",
      accessorFn: (c) => (c.banned ? "Suspended" : !c.confirmed_at ? "Pending" : "Active"),
      header: "Status",
      cell: ({ row }) => <StatusBadge client={row.original} />,
    },
    {
      id: "projects",
      accessorFn: (c) => c.projects.filter(p => p.status === "active").length,
      header: () => <div className="w-full text-right">Active projects</div>,
      cell: ({ row }) => {
        const active = row.original.projects.filter(p => p.status === "active").length;
        return <div className="w-full text-right tabular-nums text-muted-foreground">{active}</div>;
      },
    },
    {
      id: "joined",
      accessorFn: (c) => c.created_at,
      header: () => <div className="w-full text-right">Joined</div>,
      cell: ({ row }) => (
        <div className="w-full text-right text-muted-foreground">
          {new Date(row.original.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => <RowActions client={row.original} onDeleted={onDeleted} />,
      enableHiding: false,
    },
  ];
}

export function ClientsTable({ clients }: { clients: Client[] }) {
  const [data, setData] = useState(clients);
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState("");
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("deleted") === "1") {
      setToast("Account deleted.");
      const t = setTimeout(() => setToast(""), 3000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  const onDeleted = (id: string) => setData(prev => prev.filter(c => c.id !== id));
  const columns = useMemo(() => buildColumns(onDeleted), []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, rowSelection, pagination },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-6">
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-[13px] tracking-tight font-medium bg-foreground text-background shadow-lg" style={{ animation: "rise-in 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">Clients</h1>
          <p className="text-[14px] tracking-tight text-muted-foreground mt-0.5">
            {data.length} {data.length === 1 ? "client" : "clients"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <LayoutGridIcon />
              <span className="hidden lg:inline">Columns</span>
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {table.getAllColumns().filter(c => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {!inviting && (
            <Button size="sm" onClick={() => setInviting(true)}>
              <PlusIcon />
              Invite client
            </Button>
          )}
        </div>
      </div>

      {inviting && (
        <div className="rounded-2xl overflow-hidden border border-sidebar-border bg-sidebar">
          <p className="text-[12px] font-medium tracking-tight text-muted-foreground px-5 pt-4 pb-2">Invite a client</p>
          <InviteForm onDone={() => setInviting(false)} />
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-sidebar-border">
        <Table>
          <TableHeader className="bg-sidebar-accent">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No clients yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
            <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to first page</span>
              <ChevronsLeftIcon />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon />
            </Button>
            <Button variant="outline" size="icon" className="hidden size-8 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}>
              <span className="sr-only">Go to last page</span>
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
