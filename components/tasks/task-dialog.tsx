"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_KINDS } from "@/lib/constants";
import { dueInDays } from "@/services/tasks";
import type { TaskInput, TaskKind } from "@/types";

/** Atalhos que cobrem quase toda tarefa comercial. */
const SHORTCUTS: { label: string; days: number }[] = [
  { label: "Hoje", days: 0 },
  { label: "Amanhã", days: 1 },
  { label: "Em 3 dias", days: 3 },
  { label: "Em 1 semana", days: 7 },
];

/** `datetime-local` espera o horário local sem fuso, não ISO em UTC. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Negócio ao qual a tarefa pertence, quando aberta a partir de um. */
  dealId?: string;
  businessId?: string;
  dealTitle?: string;
  onSubmit: (input: TaskInput) => Promise<void>;
}

export function TaskDialog({
  open,
  onOpenChange,
  dealId,
  businessId,
  dealTitle,
  onSubmit,
}: TaskDialogProps) {
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState<TaskKind>("followup");
  const [dueAt, setDueAt] = React.useState(() => toLocalInput(dueInDays(1)));
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [wasOpen, setWasOpen] = React.useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle("");
      setKind("followup");
      setDueAt(toLocalInput(dueInDays(1)));
      setError(null);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Descreva o que precisa ser feito.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(),
        kind,
        dueAt: new Date(dueAt).toISOString(),
        dealId: dealId ?? null,
        businessId: businessId ?? null,
      });
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar a tarefa."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
          <DialogDescription>
            {dealTitle
              ? `Próxima ação de ${dealTitle}.`
              : "O que precisa ser feito, e quando."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">O que fazer</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ligar para confirmar a reunião"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-kind">Tipo</Label>
            <Select
              value={kind}
              onValueChange={(value) => setKind(value as TaskKind)}
            >
              <SelectTrigger id="task-kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_KINDS.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due">Quando</Label>
            <Input
              id="task-due"
              type="datetime-local"
              value={dueAt}
              onChange={(event) => setDueAt(event.target.value)}
              required
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SHORTCUTS.map((shortcut) => (
                <Button
                  key={shortcut.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDueAt(toLocalInput(dueInDays(shortcut.days)))}
                >
                  {shortcut.label}
                </Button>
              ))}
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : null}
              Agendar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
