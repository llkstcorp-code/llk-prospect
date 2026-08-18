import { formatShortDate } from "@/lib/format";
import type { ChartPoint } from "@/types";

const VIEWBOX_WIDTH = 720;
const VIEWBOX_HEIGHT = 220;
const PADDING = { top: 16, right: 8, bottom: 26, left: 30 };
const GRID_LINES = 4;

interface LeadsChartProps {
  data: ChartPoint[];
}

/** Série diária de leads encontrados, desenhada em SVG puro. */
export function LeadsChart({ data }: LeadsChartProps) {
  if (data.length < 2) return null;

  const innerWidth = VIEWBOX_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = VIEWBOX_HEIGHT - PADDING.top - PADDING.bottom;
  const maxValue = Math.max(...data.map((point) => point.value));
  const scaleMax = Math.ceil(maxValue / 4) * 4 || 4;

  const toX = (index: number) =>
    PADDING.left + (index / (data.length - 1)) * innerWidth;
  const toY = (value: number) =>
    PADDING.top + innerHeight - (value / scaleMax) * innerHeight;

  const line = data
    .map((point, index) => `${toX(index).toFixed(2)},${toY(point.value).toFixed(2)}`)
    .join(" ");

  const area = [
    `${PADDING.left},${PADDING.top + innerHeight}`,
    line,
    `${PADDING.left + innerWidth},${PADDING.top + innerHeight}`,
  ].join(" ");

  const lastIndex = data.length - 1;
  const labelIndexes = [0, Math.floor(lastIndex / 2), lastIndex];
  const columnWidth = innerWidth / lastIndex;

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      className="w-full"
      role="img"
      aria-label="Leads encontrados nos últimos 30 dias"
    >
      {Array.from({ length: GRID_LINES + 1 }, (_, index) => {
        const value = (scaleMax / GRID_LINES) * index;
        const y = toY(value);

        return (
          <g key={index}>
            <line
              x1={PADDING.left}
              x2={VIEWBOX_WIDTH - PADDING.right}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 8}
              y={y + 3.5}
              textAnchor="end"
              className="fill-muted-foreground text-[10px] tabular-nums"
            >
              {value}
            </text>
          </g>
        );
      })}

      <polygon points={area} className="fill-brand/8" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle
        cx={toX(lastIndex)}
        cy={toY(data[lastIndex].value)}
        r={3.5}
        fill="var(--brand)"
        stroke="var(--background)"
        strokeWidth={2}
      />

      {labelIndexes.map((index) => (
        <text
          key={index}
          x={toX(index)}
          y={VIEWBOX_HEIGHT - 6}
          textAnchor={index === 0 ? "start" : index === lastIndex ? "end" : "middle"}
          className="fill-muted-foreground text-[10px] tabular-nums"
        >
          {formatShortDate(data[index].date)}
        </text>
      ))}

      {data.map((point, index) => (
        <rect
          key={point.date}
          x={toX(index) - columnWidth / 2}
          y={PADDING.top}
          width={columnWidth}
          height={innerHeight}
          fill="transparent"
          className="hover:fill-foreground/4"
        >
          <title>{`${formatShortDate(point.date)} · ${point.value} leads`}</title>
        </rect>
      ))}
    </svg>
  );
}
