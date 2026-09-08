import { NextResponse } from "next/server";

import { getCurrentUser, guardSession } from "@/lib/auth/session";
import {
  createStoredTask,
  listStoredTasks,
} from "@/services/repositories/tasks-repository";
import type { TaskInput } from "@/types";

/** GET /api/tarefas?escopo=minhas|equipe */
export async function GET(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  const scope = new URL(request.url).searchParams.get("escopo");

  try {
    const user = scope === "minhas" ? await getCurrentUser() : null;
    return NextResponse.json(
      await listStoredTasks(user ? { ownerId: user.id } : undefined)
    );
  } catch (error) {
    console.error("Falha ao listar tarefas:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as tarefas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await guardSession();
  if (denied) return denied;

  let input: TaskInput;
  try {
    input = (await request.json()) as TaskInput;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (!input.dueAt) {
    return NextResponse.json(
      { error: "Informe a data da tarefa." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await createStoredTask(input), { status: 201 });
  } catch (error) {
    console.error("Falha ao criar tarefa:", error);
    return NextResponse.json(
      { error: "Não foi possível criar a tarefa." },
      { status: 500 }
    );
  }
}
