import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANT } from "./types";

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`border-transparent capitalize ${STATUS_VARIANT[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
