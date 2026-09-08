"use client";

import * as React from "react";
import { CalendarClock, Plus } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTasks } from "@/store/tasks-store";
import type { Task, TaskInput } from "@/types";

interface NextActionCardProps {
  dealId: string;
  businessId: string;
  dealTitle: string;
  className?: string;
}

/**
 * Próxima ação deste negócio.
 *
 * Fica ao lado da timeline de propósito: uma conta o que já foi feito, a outra
 * o que falta. Um negócio sem próxima ação é um negócio esquecido, e o card
 * diz isso em vez de ficar vazio em silêncio.
 */
export function NextActionCard({
  dealId,
  businessId,
  dealTitle,
  className,
}: NextActionCardProps) {
  const { tasks, addTask, toggleTask } = useTasks();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const open = tasks
    .filter((task) => task.dealId === dealId && !task.doneAt)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  async function handleToggle(task: Task, done: boolean) {
    try {
      await toggleTask(task.id, done);
    } catch {
      toast({ title: "Não foi possível atualizar a tarefa", variant: "error" });
    }
  }

  async function handleCreate(input: TaskInput) {
    await addTask(input);
    toast({ title: "Tarefa agendada", variant: "success" });
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Próxima ação</CardTitle>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus data-icon="inline-start" />
            Agendar
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        {open.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3">
            <CalendarClock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhuma ação agendada. Sem próxima data, este negócio depende de
              alguém lembrar dele.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {open.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isOverdue={new Date(task.dueAt) < new Date()}
                onToggle={(done) => handleToggle(task, done)}
              />
            ))}
          </ul>
        )}
      </CardContent>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        dealId={dealId}
        businessId={businessId}
        dealTitle={dealTitle}
        onSubmit={handleCreate}
      />
    </Card>
  );
}
