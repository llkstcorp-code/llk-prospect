import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LodgingDemoPage } from "@/features/lodging-demo/components/lodging-demo-page";
import {
  getLodgingDemo,
  listLodgingDemoSlugs,
} from "@/features/lodging-demo/lib/get-lodging-demo";

/** Os slugs são conhecidos em build: as duas páginas saem prontas, estáticas. */
export async function generateStaticParams() {
  const slugs = await listLodgingDemoSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  props: PageProps<"/demo/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const demo = await getLodgingDemo(slug);

  if (!demo) return { title: "Página não encontrada" };

  const { city, state } = demo.location;

  return {
    title: `${demo.name} — ${city}, ${state}`,
    description: demo.tagline ?? demo.description,
    // Reforça o robots do layout: nenhuma demo deve ser indexada ou cacheada.
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function LodgingDemoRoute(
  props: PageProps<"/demo/[slug]">
) {
  const { slug } = await props.params;
  const demo = await getLodgingDemo(slug);

  if (!demo) notFound();

  return <LodgingDemoPage demo={demo} />;
}
