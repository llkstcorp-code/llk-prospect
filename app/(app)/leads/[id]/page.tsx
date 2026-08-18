import type { Metadata } from "next";

import { LeadDetail } from "@/components/leads/lead-detail";

export const metadata: Metadata = { title: "Detalhes do lead" };

export default async function LeadPage(props: PageProps<"/leads/[id]">) {
  const { id } = await props.params;

  return <LeadDetail leadId={id} />;
}
