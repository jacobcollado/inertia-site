import { Skeleton } from "@/components/ui/skeleton";

export function ClientTabSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full lg:max-w-[58%] mx-auto">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
      <Skeleton className="h-48 w-full rounded-md sm:rounded-sm" />
    </div>
  );
}
