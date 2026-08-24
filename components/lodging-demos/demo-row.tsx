"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Copy, ExternalLink } from "lucide-react";

import { useToast } from "@/components/common/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LodgingDemoSummary } from "@/features/lodging-demo/lib/get-lodging-demo";
import { formatLongDate } from "@/lib/format";

interface DemoRowProps {
  demo: LodgingDemoSummary;
}

/**
 * Uma linha da lista de demonstrações.
 *
 * É client component só por causa do "copiar link": o endereço absoluto
 * depende do domínio de onde o painel está aberto (localhost em
 * desenvolvimento, o domínio real em produção), então só o navegador sabe
 * montá-lo.
 */
export function DemoRow({ demo }: DemoRowProps) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const path = `/demo/${demo.slug}`;

  async function handleCopy() {
    const url = `${window.location.origin}${path}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copiado",
        description: url,
        variant: "success",
      });
    } catch {
      // Clipboard bloqueado (contexto inseguro ou permissão negada): mostrar
      // o endereço é melhor que falhar em silêncio — dá para copiar à mão.
      toast({
        title: "Não foi possível copiar automaticamente",
        description: url,
        variant: "error",
      });
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5">
      {demo.coverSrc ? (
        <Image
          src={demo.coverSrc}
          alt={demo.coverAlt ?? ""}
          width={160}
          height={107}
          unoptimized={demo.coverSrc.endsWith(".svg")}
          className="h-24 w-full rounded-md object-cover sm:h-16 sm:w-24"
        />
      ) : null}

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-heading text-base font-medium">{demo.name}</p>
          <Badge variant={demo.status === "client" ? "default" : "secondary"}>
            {demo.status === "client" ? "Cliente" : "Demonstração"}
          </Badge>
        </div>
        {demo.tagline ? (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {demo.tagline}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {demo.city}, {demo.state} · {demo.sectionCount}{" "}
          {demo.sectionCount === 1 ? "seção" : "seções"} · {path}
          {demo.reviewedAt
            ? ` · revisado em ${formatLongDate(demo.reviewedAt)}`
            : ""}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => void handleCopy()}>
          {copied ? <Check /> : <Copy />}
          {copied ? "Copiado" : "Copiar link"}
        </Button>
        <Button size="sm" asChild>
          {/*
            Link externo de propósito: a demo não herda o layout do painel, e
            abrir em aba nova evita que o vendedor perca o CRM de vista.
          */}
          <a href={path} target="_blank" rel="noopener noreferrer">
            Abrir
            <ExternalLink />
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
