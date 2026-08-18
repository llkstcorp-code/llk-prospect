import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AnalysisIndicator, IndicatorLevel } from "@/types";

const LEVEL_STYLES: Record<IndicatorLevel, string> = {
  alto: "text-score-high",
  medio: "text-score-medium",
  baixo: "text-muted-foreground",
};

interface OpportunityAnalysisProps {
  summary: string;
  indicators: AnalysisIndicator[];
  className?: string;
}

/** Explica, em linguagem comercial, por que a empresa é uma boa oportunidade. */
export function OpportunityAnalysis({
  summary,
  indicators,
  className,
}: OpportunityAnalysisProps) {
  return (
    <Card className={cn("[--card-spacing:--spacing(5)]", className)}>
      <CardHeader>
        <CardTitle>Por que essa empresa é uma boa oportunidade?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <blockquote className="border-l-2 border-brand/40 pl-4 text-sm leading-relaxed text-pretty text-foreground/90">
          {summary}
        </blockquote>

        <dl className="grid gap-3 sm:grid-cols-3">
          {indicators.map((indicator) => (
            <div
              key={indicator.label}
              className="rounded-lg bg-muted/60 px-3.5 py-3"
            >
              <dt className="text-xs text-muted-foreground">
                {indicator.label}
              </dt>
              <dd
                className={cn(
                  "mt-1 font-heading text-base font-medium",
                  LEVEL_STYLES[indicator.level]
                )}
              >
                {indicator.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
