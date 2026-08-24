import type { Metadata } from "next";
import { Presentation } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { DemoRow } from "@/components/lodging-demos/demo-row";
import { Card } from "@/components/ui/card";
import { listLodgingDemoSummaries } from "@/features/lodging-demo/lib/get-lodging-demo";

export const metadata: Metadata = { title: "Demonstrações" };

export default async function LodgingDemosPage() {
  const demos = await listLodgingDemoSummaries();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demonstrações"
        description="Landing pages de demonstração para pousadas e hotéis. São páginas públicas, feitas para enviar por link a um prospect antes da reunião."
      />

      {demos.length === 0 ? (
        <Card>
          <EmptyState
            icon={Presentation}
            title="Nenhuma demonstração publicada"
            description="Escreva um arquivo de dados em features/lodging-demo/data e adicione a constante ao registry em data/index.ts."
          />
        </Card>
      ) : (
        <Card className="divide-y p-0">
          {demos.map((demo) => (
            <DemoRow key={demo.slug} demo={demo} />
          ))}
        </Card>
      )}

      {/*
        A criação de demos é hoje um fluxo de desenvolvedor, e esconder isso
        do time só geraria a pergunta "onde fica o botão de criar?". Melhor
        dizer onde o trabalho acontece.
      */}
      <Card className="p-5">
        <h2 className="font-heading text-base font-medium">
          Como criar uma demonstração nova
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Ainda não existe formulário: cada demonstração é um arquivo de dados
          no projeto, publicado junto com o deploy.
        </p>
        <ol className="mt-4 space-y-2.5 text-sm">
          <li className="flex gap-3">
            <span className="text-muted-foreground tabular-nums">1.</span>
            <span>
              Copie{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                features/lodging-demo/data/pousada-tulha.ts
              </code>{" "}
              e troque o conteúdo. Campo que você não tiver, deixe de fora — a
              seção correspondente simplesmente não aparece na página.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-muted-foreground tabular-nums">2.</span>
            <span>
              Adicione a constante ao array em{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                data/index.ts
              </code>
              . A validação roda no build e aponta o que estiver inconsistente.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-muted-foreground tabular-nums">3.</span>
            <span>
              A página passa a existir em{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                /demo/&lt;slug&gt;
              </code>{" "}
              e aparece nesta lista, pronta para compartilhar.
            </span>
          </li>
        </ol>
      </Card>
    </div>
  );
}
