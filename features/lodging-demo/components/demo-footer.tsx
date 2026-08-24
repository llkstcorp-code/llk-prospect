import type { LodgingDemo } from "../types/lodging-demo";
import { InstagramLink, WhatsappLink } from "./contact-links";

/**
 * Rodapé com o rastro do dado: endereço, contatos, créditos de imagem e a
 * proveniência (quem revisou e quando). A repetição do aviso de demonstração é
 * proposital — quem chega pelo fim da página também precisa vê-lo.
 */
export function DemoFooter({ demo }: { demo: LodgingDemo }) {
  const { address, district, city, state } = demo.location;
  const credits = Array.from(
    new Set(
      demo.images
        .map((image) => image.credit)
        .filter((credit): credit is string => Boolean(credit))
    )
  );

  return (
    <footer className="mt-[var(--demo-gap)] border-t border-[var(--demo-rule)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="demo-eyebrow">Endereço</p>
            <address className="mt-3 text-sm not-italic leading-relaxed">
              {address ? <>{address}<br /></> : null}
              {district ? <>{district}<br /></> : null}
              {city} — {state}
            </address>
          </div>

          <div>
            <p className="demo-eyebrow">Contato</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              <WhatsappLink demo={demo} verbose />
              <InstagramLink demo={demo} />
            </div>
          </div>

          {credits.length > 0 ? (
            <div>
              <p className="demo-eyebrow">Imagens</p>
              <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[var(--demo-muted)]">
                {credits.map((credit) => (
                  <li key={credit}>{credit}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 border-t border-[var(--demo-rule)] pt-6 text-xs leading-relaxed text-[var(--demo-muted)]">
          <p>
            Projeto demonstrativo — página não oficial. {demo.name} é um
            estabelecimento fictício; nomes, textos, preços e avaliações foram
            criados para esta apresentação.
          </p>
          {demo.provenance ? (
            <p className="mt-2">
              Dados revisados em{" "}
              <time dateTime={demo.provenance.reviewedAt}>
                {demo.provenance.reviewedAt.split("-").reverse().join("/")}
              </time>
              {demo.provenance.notes?.length
                ? ` · ${demo.provenance.notes.join(" · ")}`
                : null}
            </p>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
