import { NextResponse } from "next/server";

import { guardSession } from "@/lib/auth/session";
import {
  deleteStoredTask,
  setStoredTaskDone,
} from "@/services/repositories/tasks-repository";

interface UpdateTaskBody {
  done?: boolean;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  let body: UpdateTaskBody;
  try {
    body = (await request.json()) as UpdateTaskBody;
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  if (typeof body.done !== "boolean") {
    return NextResponse.json(
      { error: "Nenhuma alteração válida foi informada." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await setStoredTaskDone(id, body.done));
  } catch (error) {
    console.error(`Falha ao atualizar tarefa ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a tarefa." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const denied = await guardSession();
  if (denied) return denied;

  try {
    await deleteStoredTask(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Falha ao remover tarefa ${id}:`, error);
    return NextResponse.json(
      { error: "Não foi possível remover a tarefa." },
      { status: 500 }
    );
  }
}
