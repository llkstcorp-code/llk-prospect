import type { ServiceOffering } from "@/types";

/**
 * O catálogo de serviços como um valor que circula pelo código.
 *
 * Antes cada módulo importava o array mockado direto e todos enxergavam um
 * catálogo diferente do que estava no banco. Agora quem precisa do catálogo
 * recebe ele: o servidor busca em `services-repository`, a interface recebe do
 * `<ServicesProvider>`, e estas funções apenas consultam o que foi entregue.
 */
export type ServiceCatalog = readonly ServiceOffering[];

export function findService(
  catalog: ServiceCatalog,
  id: string
): ServiceOffering | undefined {
  return catalog.find((service) => service.id === id);
}

export function getServiceName(catalog: ServiceCatalog, id: string): string {
  return findService(catalog, id)?.name ?? "Serviço não definido";
}

export function getServicePrice(catalog: ServiceCatalog, id: string): number {
  return findService(catalog, id)?.price ?? 0;
}

/**
 * Resolve o serviço recomendado de uma empresa, caindo no primeiro do catálogo
 * quando o id recomendado não existe mais. Só devolve `undefined` se o catálogo
 * estiver vazio — situação em que não há o que recomendar.
 */
export function resolveRecommendedService(
  catalog: ServiceCatalog,
  recommendedServiceId: string
): ServiceOffering | undefined {
  return findService(catalog, recommendedServiceId) ?? catalog[0];
}
