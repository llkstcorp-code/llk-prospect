"use client";

import * as React from "react";
import { Loader2, MessageSquarePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatLongDate } from "@/lib/format";
import type { LeadNote } from "@/types";

interface LeadNotesProps {
  notes: LeadNote[];
  onAdd: (content: string) => Promise<void>;
}

export function LeadNotes({ notes, onAdd }: LeadNotesProps) {
  const [content, setContent] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setIsPending(true);
    try {
      await onAdd(trimmed);
      setContent("");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="[--card-spacing:--spacing(5)]">
      <CardHeader>
        <CardTitle>Observações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Registre um detalhe da negociação, um combinado ou o próximo passo."
            rows={3}
            aria-label="Nova observação"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !content.trim()}
            >
              {isPending ? (
                <Loader2 className="animate-spin" />
              ) : (
                <MessageSquarePlus data-icon="inline-start" />
              )}
              Adicionar observação
            </Button>
          </div>
        </form>

        {notes.length > 0 ? (
          <ul className="space-y-3 border-t border-border pt-4">
            {notes.map((note) => (
              <li key={note.id} className="rounded-lg bg-muted/60 p-3.5">
                <p className="text-sm text-pretty">{note.content}</p>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatLongDate(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="border-t border-border pt-4 text-sm text-muted-foreground">
            Nenhuma observação registrada até agora.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
