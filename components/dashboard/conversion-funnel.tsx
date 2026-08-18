import { formatNumber } from "@/lib/format";
import type { FunnelStage } from "@/types";

const MIN_BAR_WIDTH = 6;

interface ConversionFunnelProps {
  stages: FunnelStage[];
}

/** Funil de conversão dos leads, do primeiro contato ao fechamento. */
export function ConversionFunnel({ stages }: ConversionFunnelProps) {
  const total = stages[0]?.value ?? 0;

  return (
    <ol className="space-y-4">
      {stages.map((stage, index) => {
        const previous = stages[index - 1];
        const width = total
          ? Math.max((stage.value / total) * 100, MIN_BAR_WIDTH)
          : 0;
        const conversion = previous?.value
          ? Math.round((stage.value / previous.value) * 100)
          : null;

        return (
          <li key={stage.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-medium">{stage.label}</p>
              <p className="flex items-baseline gap-2 text-sm tabular-nums">
                <span className="font-medium">{formatNumber(stage.value)}</span>
                {conversion !== null ? (
                  <span className="text-xs text-muted-foreground">
                    {conversion}%
                  </span>
                ) : null}
              </p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-500"
                style={{
                  width: `${width}%`,
                  opacity: 1 - index * 0.13,
                }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
