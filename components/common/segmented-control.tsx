"use client";

import { cn } from "@/lib/utils";

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  "aria-label"?: string;
  className?: string;
}

/** Alternativa compacta ao radio group para escolhas curtas e excludentes. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={props["aria-label"]}
      className={cn(
        "grid w-full grid-flow-col auto-cols-fr gap-1 rounded-lg bg-muted p-1",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-7 rounded-md px-2 text-[0.8rem] font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isSelected
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
