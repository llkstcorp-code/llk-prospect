import type { Metadata } from "next";

import { BusinessDetail } from "@/components/business/business-detail";
import { getStoredBusiness } from "@/services/repositories/businesses-repository";

export async function generateMetadata(
  props: PageProps<"/empresas/[id]">
): Promise<Metadata> {
  const { id } = await props.params;
  const business = await getStoredBusiness(id);

  return { title: business?.name ?? "Empresa não encontrada" };
}

export default async function BusinessPage(props: PageProps<"/empresas/[id]">) {
  const { id } = await props.params;

  return <BusinessDetail businessId={id} />;
}
