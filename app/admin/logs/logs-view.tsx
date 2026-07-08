"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  LayoutGridIcon,
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
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type ApiLog = {
  id: string;
  route: string;
  method: string;
  status: number;
  key: string | null;
  domain: string | null;
  ip: string | null;
  error: string | null;
  created_at: string;
};

const ROUTE_LABELS: Record<string, string> = {
  "/api/validate-license": "validate",
  "/api/activate-license": "activate",
};

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function buildColumns(): ColumnDef<ApiLog>[] {
  return [
    {
      id: "time",
      accessorFn: (l) => l.created_at,
      header: "Time",
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">{dateFmt.format(new Date(row.original.created_at))}</span>
      ),
    },
    {
      id: "route",
      accessorFn: (l) => l.route,
      header: "Route",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono border-transparent bg-sidebar-accent text-foreground">
          {ROUTE_LABELS[row.original.route] ?? row.original.route}
        </Badge>
      ),
    },
    {
      id: "key",
      accessorFn: (l) => l.key ?? "",
      header: "Key",
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted-foreground">
          {row.original.key ?? <span className="opacity-40">—</span>}
        </span>
      ),
    },
    {
      id: "domain",
      accessorFn: (l) => l.domain ?? "",
      header: "Domain",
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted-foreground max-w-[180px] truncate block">
          {row.original.domain ?? <span className="opacity-40">—</span>}
        </span>
      ),
    },
    {
      id: "ip",
      accessorFn: (l) => l.ip ?? "",
      header: "IP",
      cell: ({ row }) => (
        <span className="font-mono text-[12px] text-muted-foreground whitespace-nowrap">{row.original.ip ?? "—"}</span>
      ),
    },
    {
      id: "result",
      accessorFn: (l) => (l.error ? "error" : "ok"),
      header: "Result",
      cell: ({ row }) => {
        const ok = !row.original.error;
        return ok ? (
          <Badge variant="outline" className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">ok</Badge>
        ) : (
          <Badge variant="outline" className="border-transparent bg-destructive/15 text-destructive max-w-[140px] truncate" title={row.original.error ?? ""}>
            {row.original.error}
          </Badge>
        );
      },
    },
  ];
}

export function LogsView() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<string>("all");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: "time", desc: true }]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

  useEffect(() => {
    setLoading(true);
    const supabase = createBrowserClient();
    supabase
      .from("api_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => {
        setLogs(data ?? []);
        setLoading(false);
      });
  }, []);

  const routes = useMemo(() => Array.from(new Set(logs.map(l => l.route))), [logs]);
  const filtered = useMemo(() => route === "all" ? logs : logs.filter(l => l.route === route), [logs, route]);
  const columns = useMemo(() => buildColumns(), []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, columnVisibility, pagination },
    getRowId: (row) => row.id,
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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[1.6rem] font-semibold tracking-[-0.04em] leading-snug text-foreground">API Logs</h1>
          <p className="text-[14px] tracking-tight text-muted-foreground mt-0.5">{filtered.length} entries</p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup multiple={false} value={[route]} onValueChange={(v) => setRoute(v[0] ?? "all")} variant="outline">
            <ToggleGroupItem value="all" className="data-[state=on]:bg-primary data-[state=on]:text-white">All</ToggleGroupItem>
            {routes.map(r => (
              <ToggleGroupItem key={r} value={r} className="data-[state=on]:bg-primary data-[state=on]:text-white">
                {ROUTE_LABELS[r] ?? r}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              <LayoutGridIcon />
              <span className="hidden lg:inline">Columns</span>
              <ChevronDownIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
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
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-sidebar-border">
          <Table>
            <TableHeader className="bg-sidebar-accent">
              <TableRow>
                {["Time", "Route", "Key", "Domain", "IP", "Result"].map(h => (
                  <TableHead key={h} className="whitespace-nowrap">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 rounded-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-sidebar-border">
            <Table>
              <TableHeader className="bg-sidebar-accent">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
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
                      No logs yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
              Page {table.getState().pagination.pageIndex + 1} of {Math.max(table.getPageCount(), 1)}
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">Rows per page</Label>
                <Select value={`${table.getState().pagination.pageSize}`} onValueChange={(value) => value && table.setPageSize(Number(value))}>
                  <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[20, 50, 100, 200].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>{pageSize}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        </>
      )}
    </div>
  );
}
