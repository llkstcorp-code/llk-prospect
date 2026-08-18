import { cn } from "@/lib/utils";

interface BrandProps {
  className?: string;
}

/** Marca do produto: logo "LLK" + nome "Prospect". */
export function Brand({ className }: BrandProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="flex h-8 items-center rounded-lg bg-brand px-2 font-heading text-xs font-semibold tracking-[0.08em] text-brand-foreground">
        LLK
      </span>
      <span className="font-heading text-[0.95rem] font-medium tracking-tight">
        Prospect
      </span>
    </div>
  );
}
