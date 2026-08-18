"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";

import { SEARCH_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEP_DURATION = 400;

/** Feedback em etapas enquanto a busca de empresas acontece. */
export function SearchProgress() {
  const [currentStep, setCurrentStep] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((step) => Math.min(step + 1, SEARCH_STEPS.length - 1));
    }, STEP_DURATION);

    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / SEARCH_STEPS.length) * 100;

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-sm">
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ol className="mt-6 space-y-3" aria-live="polite">
          {SEARCH_STEPS.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-2.5 text-sm transition-colors",
                  isCurrent && "text-foreground",
                  isDone && "text-muted-foreground",
                  !isDone && !isCurrent && "text-muted-foreground/50"
                )}
              >
                <span className="flex size-4 shrink-0 items-center justify-center">
                  {isDone ? (
                    <Check className="size-3.5 text-positive" strokeWidth={3} />
                  ) : isCurrent ? (
                    <Loader2 className="size-3.5 animate-spin text-brand" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
