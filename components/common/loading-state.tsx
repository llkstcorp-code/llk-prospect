import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = "Carregando...",
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-16 text-sm text-muted-foreground",
        className
      )}
    >
      <Loader2 className="size-4 animate-spin" />
      {message}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-8 w-20" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 px-4 py-3.5"
          style={{ opacity: 1 - rowIndex * 0.1 }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={cn("h-4 flex-1", columnIndex === 0 && "flex-[2]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card p-5 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-24" />
          <Skeleton className="mt-6 h-3 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="mt-3 h-4 w-40" />
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-52 rounded-xl lg:col-span-2" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}
