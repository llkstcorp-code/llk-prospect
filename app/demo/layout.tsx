import type { Metadata } from "next";

import "@/features/lodging-demo/styles/demo.css";

/**
 * Camada pública das landing pages.
 *
 * Não usa o `AppShell` do painel: aqui não existe sidebar, cabeçalho de CRM
 * nem nada da aparência de dashboard. O que herda do layout raiz são só os
 * providers de contexto (sem efeito visual) e o reset do Tailwind.
 *
 * O `robots` vale para toda a árvore `/demo/*`: as demos são compartilhadas
 * por link com prospects e não devem entrar em buscador.
 */
export const metadata: Metadata = {
  /*
   * O layout raiz aplica o template "%s · LLK Prospect". Numa página enviada a
   * um prospect isso entregaria o nome da ferramenta interna na aba do
   * navegador, então o template é zerado aqui.
   */
  title: { template: "%s", default: "Projeto demonstrativo" },
  robots: { index: false, follow: false, nocache: true },
};

export default function DemoLayout({ children }: LayoutProps<"/demo">) {
  return children;
}
