/**
 * 404 das demonstrações.
 *
 * Fica de propósito fora da identidade do painel e fora da identidade de
 * qualquer pousada: quem cai aqui seguiu um link antigo ou digitou errado, e
 * não deve ver o CRM nem ser convidado a entrar nele.
 */
export default function DemoNotFound() {
  return (
    <main className="flex min-h-svh flex-col justify-center bg-neutral-950 px-6 text-neutral-100">
      <div className="mx-auto w-full max-w-xl">
        <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-neutral-500">
          Projeto demonstrativo
        </p>
        <h1 className="mt-5 text-3xl leading-tight sm:text-4xl">
          Esta demonstração não existe mais neste endereço.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-400">
          O link pode ter sido digitado com um caractere a mais ou a
          demonstração pode ter sido substituída por uma versão nova. Peça o
          endereço atualizado a quem enviou a página.
        </p>
      </div>
    </main>
  );
}
