/**
 * Faixa que identifica a página como demonstração.
 *
 * Fica no topo do fluxo (primeiro elemento lido por leitor de tela e primeiro
 * visto no scroll) e não é dispensável: um prospect precisa entender em um
 * segundo que a página não é oficial. Cores próprias, de propósito fora da
 * paleta da demo — ela não deve parecer parte do projeto da pousada.
 */
export function DemoNotice() {
  return (
    <div className="bg-neutral-950 text-neutral-100">
      <p className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-3 gap-y-1 px-5 py-2.5 text-[0.75rem] leading-snug sm:px-8">
        <span className="font-medium tracking-wide">
          Projeto demonstrativo — página não oficial
        </span>
        <span className="text-neutral-400">
          Estabelecimento fictício, criado pela LLK para apresentar a proposta.
        </span>
      </p>
    </div>
  );
}
