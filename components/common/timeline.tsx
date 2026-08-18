import {
  CalendarCheck,
  CircleCheck,
  CircleX,
  FileText,
  MessageSquare,
  Plus,
  ScanSearch,
  Send,
  StickyNote,
} from "lucide-react";

import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TimelineEvent, TimelineEventType } from "@/types";

const EVENT_ICON: Record<TimelineEventType, React.ElementType> = {
  created: Plus,
  analysis: ScanSearch,
  contact: Send,
  reply: MessageSquare,
  meeting: CalendarCheck,
  proposal: FileText,
  won: CircleCheck,
  lost: CircleX,
  note: StickyNote,
};

const EVENT_STYLE: Partial<Record<TimelineEventType, string>> = {
  won: "bg-positive-surface text-positive",
  lost: "bg-muted text-negative",
};

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol className={cn("relative space-y-5", className)}>
      {events.map((event, index) => {
        const Icon = EVENT_ICON[event.type];
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="relative flex gap-3.5">
            {!isLast ? (
              <span
                aria-hidden
                className="absolute top-8 bottom-[-1.25rem] left-[0.9375rem] w-px bg-border"
              />
            ) : null}
            <span
              className={cn(
                "z-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground ring-4 ring-background",
                EVENT_STYLE[event.type]
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-medium">{event.title}</p>
                <time
                  dateTime={event.date}
                  className="text-xs text-muted-foreground tabular-nums"
                >
                  {formatShortDate(event.date)}
                </time>
              </div>
              {event.description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {event.description}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
