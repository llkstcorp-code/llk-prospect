import { imagesByRole } from "../../lib/section-visibility";
import type { LodgingDemo, LodgingImage } from "../../types/lodging-demo";
import { DemoImage } from "../demo-image";
import { DemoSection, SectionHeading } from "../section";

interface GalleryProps {
  demo: LodgingDemo;
}

export function Gallery({ demo }: GalleryProps) {
  const images = imagesByRole(demo, "gallery");
  if (images.length === 0) return null;

  switch (demo.design.gallery) {
    case "masonry":
      return <MasonryGallery images={images} />;
    case "horizontal":
      return <HorizontalGallery images={images} />;
    case "editorial":
      return <EditorialGallery images={images} />;
  }
}

function Caption({ image }: { image: LodgingImage }) {
  if (!image.caption) return null;
  return (
    <figcaption className="mt-2.5 text-xs leading-relaxed text-[var(--demo-muted)]">
      {image.caption}
    </figcaption>
  );
}

/* ----------------------------------------------------------------- masonry */

/**
 * Ritmo assimétrico: duas colunas, a da direita descolada verticalmente, e a
 * primeira foto ocupando a largura toda. Nada de grade regular de três.
 */
function MasonryGallery({ images }: { images: LodgingImage[] }) {
  const [lead, ...rest] = images;
  const left = rest.filter((_, index) => index % 2 === 0);
  const right = rest.filter((_, index) => index % 2 === 1);

  return (
    <DemoSection id="galeria">
      <figure>
        <DemoImage
          image={lead}
          sizes="(max-width: 640px) 100vw, 90vw"
          className="h-[42vh] w-full min-h-[240px] sm:h-[62vh]"
        />
        <Caption image={lead} />
      </figure>

      {rest.length > 0 ? (
        <div className="mt-[var(--demo-gap-tight)] grid gap-x-8 gap-y-[var(--demo-gap-tight)] sm:grid-cols-2">
          <div className="space-y-[var(--demo-gap-tight)]">
            {left.map((image) => (
              <figure key={image.src}>
                <DemoImage
                  image={image}
                  sizes="(max-width: 640px) 100vw, 45vw"
                  className="w-full"
                />
                <Caption image={image} />
              </figure>
            ))}
          </div>
          <div className="space-y-[var(--demo-gap-tight)] sm:mt-16">
            {right.map((image) => (
              <figure key={image.src}>
                <DemoImage
                  image={image}
                  sizes="(max-width: 640px) 100vw, 45vw"
                  className="w-full"
                />
                <Caption image={image} />
              </figure>
            ))}
          </div>
        </div>
      ) : null}
    </DemoSection>
  );
}

/* -------------------------------------------------------------- horizontal */

/**
 * Trilho horizontal com snap. É rolagem nativa — sem carrossel em JavaScript,
 * sem estado no cliente — e funciona com teclado porque o container é focável.
 */
function HorizontalGallery({ images }: { images: LodgingImage[] }) {
  return (
    <DemoSection id="galeria" bleed>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="A casa" />
      </div>

      <div
        className="demo-scroller mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-6 sm:gap-6 sm:px-8"
        tabIndex={0}
        role="group"
        aria-label="Galeria de fotos, rolagem horizontal"
      >
        {images.map((image) => (
          <figure
            key={image.src}
            className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-[34vw]"
          >
            <DemoImage
              image={image}
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 34vw"
              className="aspect-[4/5] w-full"
            />
            <Caption image={image} />
          </figure>
        ))}
      </div>
    </DemoSection>
  );
}

/* --------------------------------------------------------------- editorial */

/** Alterna foto larga e foto estreita, com a legenda ocupando a coluna vazia. */
function EditorialGallery({ images }: { images: LodgingImage[] }) {
  return (
    <DemoSection id="galeria" className="space-y-[var(--demo-gap-tight)]">
      {images.map((image, index) => (
        <figure
          key={image.src}
          className={
            index % 2 === 0
              ? "grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] sm:items-end"
              : "grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:items-end"
          }
        >
          <DemoImage
            image={image}
            sizes="(max-width: 640px) 100vw, 60vw"
            className={index % 2 === 0 ? "w-full" : "order-2 w-full"}
          />
          <Caption image={image} />
        </figure>
      ))}
    </DemoSection>
  );
}
