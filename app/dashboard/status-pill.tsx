import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANT } from "./types";

const DESTRUCTIVE_PILL_BG = "color-mix(in srgb, var(--sh-destructive) 15%, transparent)";

export function StatusPill({ status }: { status: string }) {
  const destructive = status === "overdue" || status === "revoked";
  const classes = destructive
    ? "text-destructive"
    : (STATUS_VARIANT[status] ?? "bg-muted text-muted-foreground");

  return (
    <Badge
      variant="outline"
      className={`border-transparent capitalize shrink-0 ${classes}`}
      style={destructive ? { backgroundColor: DESTRUCTIVE_PILL_BG } : undefined}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
