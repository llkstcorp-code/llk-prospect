"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarCheck, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { SegmentedControl } from "@/components/common/segmented-control";
import { useToast } from "@/components/common/toast";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { TaskRow } from "@/components/tasks/task-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { bucketTasks, type TaskScope } from "@/services/tasks";
import { useTasks } from "@/store/tasks-store";
import type { Task, TaskInput } from "@/types";

const SCOPES: { value: TaskScope; label: string }[] = [
  { value: "equipe", label: "Da equipe" },
  { value: "minhas", label: "Minhas" },
];

interface SectionProps {
  title: string;
  tasks: Task[];
  isOverdue?: boolean;
  onToggle: (task: Task, done: boolean) => void;
  onRemove: (task: Task) => void;
}

function Section({ title, tasks, isOverdue, onToggle, onRemove }: SectionProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="space-y-2">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        {title}
        <span className="text-xs font-normal text-muted-foreground tabular-nums">
          {tasks.length}
        </span>
      </h2>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            isOverdue={isOverdue}
            onToggle={(done) => onToggle(task, done)}
            onRemove={() => onRemove(task)}
          />
        ))}
      </ul>
    </section>
  );
}

export default function TodayPage() {
  const { toast } = useToast();
  const { tasks, scope, setScope, isLoading, addTask, toggleTask, removeTask } =
    useTasks();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const buckets = bucketTasks(tasks);
  const pending =
    buckets.overdue.length + buckets.today.length + buckets.week.length;

  async function handleToggle(task: Task, done: boolean) {
    try {
      await toggleTask(task.id, done);
    } catch {
      toast({ title: "Não foi possível atualizar a tarefa", variant: "error" });
    }
  }

  async function handleRemove(task: Task) {
    try {
      await removeTask(task.id);
      toast({ title: "Tarefa removida", variant: "success" });
    } catch {
      toast({ title: "Não foi possível remover a tarefa", variant: "error" });
    }
  }

  async function handleCreate(input: TaskInput) {
    await addTask(input);
    toast({ title: "Tarefa agendada", variant: "success" });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hoje"
        description="O que precisa de você agora, antes que o funil esfrie."
        actions={
          <>
            <SegmentedControl
              value={scope}
              options={SCOPES}
              onChange={setScope}
              aria-label="Escopo das tarefas"
            />
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus data-icon="inline-start" />
              Nova tarefa
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="max-w-3xl space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : pending === 0 && buckets.later.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarCheck}
            title="Nada pendente"
            description="Nenhuma tarefa em aberto. Mova um negócio para Contatado ou Proposta e o follow-up é agendado sozinho."
            action={
              <Button variant="outline" asChild>
                <Link href="/crm">Ir para o funil</Link>
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="max-w-3xl space-y-6">
          <Section
            title="Atrasadas"
            tasks={buckets.overdue}
            isOverdue
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
          <Section
            title="Hoje"
            tasks={buckets.today}
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
          <Section
            title="Próximos 7 dias"
            tasks={buckets.week}
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
          <Section
            title="Mais adiante"
            tasks={buckets.later}
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
          <Section
            title="Concluídas hoje"
            tasks={buckets.done}
            onToggle={handleToggle}
            onRemove={handleRemove}
          />
        </div>
      )}

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
