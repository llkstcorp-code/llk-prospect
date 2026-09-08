"use client";

import * as React from "react";

import * as tasksService from "@/services/tasks";
import type { TaskScope } from "@/services/tasks";
import type { Task, TaskInput } from "@/types";

interface TasksContextValue {
  tasks: Task[];
  scope: TaskScope;
  setScope: (scope: TaskScope) => void;
  isLoading: boolean;
  error: string | null;
  overdueCount: number;
  reload: () => void;
  addTask: (input: TaskInput) => Promise<Task>;
  toggleTask: (id: string, done: boolean) => Promise<Task>;
  removeTask: (id: string) => Promise<void>;
}

const TasksContext = React.createContext<TasksContextValue | null>(null);

/**
 * Agenda do funil.
 *
 * Vive num provider porque duas telas dependem dela ao mesmo tempo: /hoje, que
 * lista, e o cabeçalho, que mostra o contador de atrasadas em toda página.
 */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [scope, setScope] = React.useState<TaskScope>("equipe");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const result = await tasksService.getTasks(scope);
        if (active) setTasks(result);
      } catch {
        if (active) setError("Não foi possível carregar as tarefas.");
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [scope, reloadToken]);

  const reload = React.useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  const replace = React.useCallback((updated: Task) => {
    setTasks((current) =>
      current.some((task) => task.id === updated.id)
        ? current.map((task) => (task.id === updated.id ? updated : task))
        : [...current, updated]
    );
  }, []);

  const value = React.useMemo<TasksContextValue>(
    () => ({
      tasks,
      scope,
      setScope,
      isLoading,
      error,
      overdueCount: tasksService.countOverdue(tasks),
      reload,
      addTask: async (input) => {
        const task = await tasksService.createTask(input);
        replace(task);
        return task;
      },
      toggleTask: async (id, done) => {
        const task = await tasksService.setTaskDone(id, done);
        replace(task);
        return task;
      },
      removeTask: async (id) => {
        await tasksService.deleteTask(id);
        setTasks((current) => current.filter((task) => task.id !== id));
      },
    }),
    [tasks, scope, isLoading, error, reload, replace]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}

export function useTasks(): TasksContextValue {
  const context = React.useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks precisa estar dentro de <TasksProvider>.");
  }
  return context;
}
