import type { Task, TaskInput } from "@/types";
import { API_ENDPOINTS } from "./api";

export type TaskScope = "minhas" | "equipe";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error ?? `Requisição falhou: ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function getTasks(scope: TaskScope = "equipe"): Promise<Task[]> {
  return request<Task[]>(API_ENDPOINTS.tasksOf(scope));
}

export async function createTask(input: TaskInput): Promise<Task> {
  return request<Task>(API_ENDPOINTS.tasks, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function setTaskDone(id: string, done: boolean): Promise<Task> {
  return request<Task>(API_ENDPOINTS.task(id), {
    method: "PATCH",
    body: JSON.stringify({ done }),
  });
}

export async function deleteTask(id: string): Promise<void> {
  return request<void>(API_ENDPOINTS.task(id), { method: "DELETE" });
}

/** Meia-noite de hoje — a fronteira entre atrasada e a vencer. */
function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export interface TaskBuckets {
  overdue: Task[];
  today: Task[];
  week: Task[];
  later: Task[];
  done: Task[];
}

/**
 * Separa as tarefas pelo que a pergunta "o que eu faço hoje" exige.
 *
 * Atrasada é o que venceu antes de hoje e continua aberta — o que passou da
 * hora dentro do próprio dia ainda é de hoje, não é dívida.
 */
export function bucketTasks(tasks: Task[]): TaskBuckets {
  const start = startOfToday();
  const tomorrow = new Date(start);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inAWeek = new Date(start);
  inAWeek.setDate(inAWeek.getDate() + 7);

  const buckets: TaskBuckets = {
    overdue: [],
    today: [],
    week: [],
    later: [],
    done: [],
  };

  for (const task of tasks) {
    if (task.doneAt) {
      buckets.done.push(task);
      continue;
    }
    const due = new Date(task.dueAt);
    if (due < start) buckets.overdue.push(task);
    else if (due < tomorrow) buckets.today.push(task);
    else if (due < inAWeek) buckets.week.push(task);
    else buckets.later.push(task);
  }

  return buckets;
}

export function countOverdue(tasks: Task[]): number {
  const start = startOfToday();
  return tasks.filter(
    (task) => !task.doneAt && new Date(task.dueAt) < start
  ).length;
}

/** Data ISO de daqui a N dias, para os atalhos do formulário. */
export function dueInDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}
