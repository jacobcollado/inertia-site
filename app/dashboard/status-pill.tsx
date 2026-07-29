import { Badge } from "@/components/ui/badge";
import { STATUS_VARIANT } from "./types";

export function StatusPill({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`border-transparent capitalize shrink-0 ${STATUS_VARIANT[status] ?? "bg-muted text-muted-foreground"}`}>
      {status.replace("_", " ")}
    </Badge>
  );
}
