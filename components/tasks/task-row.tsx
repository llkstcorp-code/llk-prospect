"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getTaskKindLabel } from "@/lib/constants";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  /** Realça o vencimento em vermelho — usado no bloco de atrasadas. */
  isOverdue?: boolean;
  onToggle: (done: boolean) => void;
  onRemove?: () => void;
}

function formatDue(value: string): string {
  const date = new Date(value);
  const time = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatLongDate(value)} às ${time}`;
}

export function TaskRow({
  task,
  isOverdue = false,
  onToggle,
  onRemove,
}: TaskRowProps) {
  const isDone = Boolean(task.doneAt);

  return (
    <li className="flex items-start gap-3 rounded-lg border border-border p-3">
      <Checkbox
        checked={isDone}
        onCheckedChange={(checked) => onToggle(checked === true)}
        aria-label={isDone ? `Reabrir ${task.title}` : `Concluir ${task.title}`}
        className="mt-0.5"
      />

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "font-medium",
              isDone && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          <Badge variant="secondary">{getTaskKindLabel(task.kind)}</Badge>
          {task.isAutomatic ? (
            <span
              title="Agendada pelo sistema ao mover o negócio de etapa"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            >
              <Sparkles className="size-3.5" />
              automática
            </span>
          ) : null}
        </div>

        <p
          className={cn(
            "text-xs",
            isOverdue && !isDone ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {formatDue(task.dueAt)}
          {task.ownerName ? ` · ${task.ownerName}` : ""}
        </p>

        {task.dealId ? (
          <p className="truncate text-xs text-muted-foreground">
            <Link
              href={`/negocios/${task.dealId}`}
              className="hover:underline"
            >
              {task.dealTitle ?? "Negócio"}
            </Link>
            {task.businessName ? ` · ${task.businessName}` : ""}
          </p>
        ) : null}
      </div>

      {onRemove ? (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remover ${task.title}`}
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      ) : null}
    </li>
  );
}
