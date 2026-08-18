"use client";

import * as React from "react";
import { Check, Copy, MessageCircle, Sparkles } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COPY_FEEDBACK_DURATION = 2000;

interface PitchCardProps {
  pitch: string;
  phone: string;
  onSendWhatsApp: () => void;
  className?: string;
}

/** Abordagem comercial sugerida para o primeiro contato. */
export function PitchCard({
  pitch,
  phone,
  onSendWhatsApp,
  className,
}: PitchCardProps) {
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pitch);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), COPY_FEEDBACK_DURATION);
      toast({
        title: "Mensagem copiada",
        description: "A abordagem está na sua área de transferência.",
        variant: "success",
      });
    } catch {
      toast({
        title: "Não foi possível copiar",
        description: "Copie o texto manualmente na caixa acima.",
        variant: "error",
      });
    }
  }

  return (
    <Card className={cn("[--card-spacing:--spacing(5)]", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand" />
          Sugestão de abordagem
        </CardTitle>
        <CardDescription>
          Mensagem gerada a partir dos dados públicos da empresa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-lg bg-muted/60 p-4 text-sm leading-relaxed text-pretty">
          {pitch}
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => void handleCopy()}>
            {hasCopied ? (
              <Check data-icon="inline-start" className="text-positive" />
            ) : (
              <Copy data-icon="inline-start" />
            )}
            {hasCopied ? "Copiado" : "Copiar mensagem"}
          </Button>
          <Button onClick={onSendWhatsApp}>
            <MessageCircle data-icon="inline-start" />
            Enviar pelo WhatsApp
          </Button>
          <span className="flex items-center text-xs text-muted-foreground sm:ml-auto">
            {phone}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
