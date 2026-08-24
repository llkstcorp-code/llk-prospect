import { validateLodgingDemos } from "../lib/validate-lodging-demo";
import type { LodgingDemo } from "../types/lodging-demo";
import { casaDuna } from "./casa-duna";
import { pousadaRioTorto } from "./pousada-rio-torto";
import { pousadaTulha } from "./pousada-tulha";

/**
 * Registry das demonstrações.
 *
 * A validação roda aqui, no momento em que o módulo é avaliado — ou seja, no
 * `next dev` e no `next build`. Uma demo com dado inconsistente derruba o
 * build com a mensagem do problema, em vez de virar uma página quebrada na
 * frente de um prospect.
 *
 * Para criar uma demo nova: escreva o arquivo de dados ao lado destes e some
 * a constante ao array. Nada mais precisa mudar.
 */
export const lodgingDemos: LodgingDemo[] = validateLodgingDemos([
  pousadaRioTorto,
  casaDuna,
  pousadaTulha,
]);
