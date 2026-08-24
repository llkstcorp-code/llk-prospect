import { imageForRole } from "../../lib/section-visibility";
import type { Attraction, LodgingDemo } from "../../types/lodging-demo";
import { DemoImage } from "../demo-image";
import { DemoSection, SectionHeading } from "../section";

interface DestinationProps {
  demo: LodgingDemo;
}

export function Destination({ demo }: DestinationProps) {
  const attractions = demo.attractions;
  if (!attractions || attractions.length === 0) return null;

  switch (demo.design.destination) {
    case "editorial":
      return <EditorialDestination demo={demo} attractions={attractions} />;
    case "immersive":
      return <ImmersiveDestination demo={demo} attractions={attractions} />;
    case "split":
      return <SplitDestination demo={demo} attractions={attractions} />;
  }
}

function AttractionList({
  attractions,
  columns,
}: {
  attractions: Attraction[];
  columns: boolean;
}) {
  return (
    <ul
      className={
        columns
          ? "grid gap-x-10 gap-y-8 sm:grid-cols-2"
          : "divide-y divide-[var(--demo-rule)]"
      }
    >
      {attractions.map((attraction) => (
        <li key={attraction.name} className={columns ? undefined : "py-6"}>
          <div className="flex flex-wrap items-baseline gap-x-4">
            <h3 className="text-[1.05rem] leading-snug">{attraction.name}</h3>
            {attraction.distance ? (
              <span className="text-sm text-[var(--demo-muted)]">
                {attraction.distance}
              </span>
            ) : null}
          </div>
          <p className="demo-prose mt-2 text-[0.95rem] leading-[1.7] text-[var(--demo-muted)]">
            {attraction.description}
          </p>
        </li>
      ))}
    </ul>
  );
}

/* --------------------------------------------------------------- editorial */

/** Título fica preso à esquerda enquanto a lista rola — leitura de revista. */
function EditorialDestination({
  demo,
  attractions,
}: DestinationProps & { attractions: Attraction[] }) {
  const image = imageForRole(demo, "destination");

  return (
    <DemoSection id="arredores">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-16">
        <div className="lg:sticky lg:top-16 lg:self-start">
          <SectionHeading eyebrow="Arredores" title="O que existe em volta" />
          {image ? (
            <DemoImage
              image={image}
              sizes="(max-width: 1024px) 100vw, 34vw"
              className="mt-8 aspect-[4/5] w-full"
            />
          ) : null}
        </div>

        <AttractionList attractions={attractions} columns={false} />
      </div>
    </DemoSection>
  );
}

/* --------------------------------------------------------------- immersive */

/** Foto sangrando de borda a borda, com a lista logo abaixo em duas colunas. */
function ImmersiveDestination({
  demo,
  attractions,
}: DestinationProps & { attractions: Attraction[] }) {
  const image = imageForRole(demo, "destination");

  return (
    <DemoSection id="arredores" bleed>
      {image ? (
        <DemoImage
          image={image}
          sizes="100vw"
          className="h-[44vh] w-full min-h-[240px] sm:h-[64vh]"
        />
      ) : null}

      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8 sm:pt-14">
        <SectionHeading eyebrow="Arredores" />
        <div className="mt-8">
          <AttractionList attractions={attractions} columns />
        </div>
      </div>
    </DemoSection>
  );
}

/* -------------------------------------------------------------------- split */

function SplitDestination({
  demo,
  attractions,
}: DestinationProps & { attractions: Attraction[] }) {
  const image = imageForRole(demo, "destination");

  return (
    <DemoSection id="arredores" bleed>
      <div className="grid items-stretch lg:grid-cols-2">
        {image ? (
          <div className="relative min-h-[40vh]">
            <DemoImage
              image={image}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        ) : null}
        <div className="px-5 py-12 sm:px-10">
          <SectionHeading eyebrow="Arredores" />
          <div className="mt-8">
            <AttractionList attractions={attractions} columns={false} />
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
