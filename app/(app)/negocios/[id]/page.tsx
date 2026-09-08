import type { Metadata } from "next";

import { DealDetail } from "@/components/deals/deal-detail";

export const metadata: Metadata = { title: "Detalhes do negócio" };

export default async function DealPage(props: PageProps<"/negocios/[id]">) {
  const { id } = await props.params;

  return <DealDetail dealId={id} />;
}
