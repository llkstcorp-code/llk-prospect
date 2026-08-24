import type { LodgingDemo, Room } from "../../types/lodging-demo";
import { BookingLink } from "../booking-link";
import { DemoImage } from "../demo-image";
import { DemoSection, SectionHeading } from "../section";

interface RoomsProps {
  demo: LodgingDemo;
}

/** Diária sem centavos — o preço aqui é "a partir de", não uma cobrança. */
const priceFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function Rooms({ demo }: RoomsProps) {
  const rooms = demo.rooms;
  if (!rooms || rooms.length === 0) return null;

  switch (demo.design.rooms) {
    case "full-width":
      return <FullWidthRooms demo={demo} rooms={rooms} />;
    case "alternating":
      return <AlternatingRooms demo={demo} rooms={rooms} />;
    case "grid":
      return <GridRooms demo={demo} rooms={rooms} />;
  }
}

/** Linha de dados concretos do quarto. Some inteira quando não há nenhum. */
function RoomFacts({ room }: { room: Room }) {
  const facts = [
    room.capacity ? `${room.capacity} hóspedes` : null,
    room.size ? `${room.size} m²` : null,
    room.priceFrom
      ? `a partir de ${priceFormatter.format(room.priceFrom)} a diária`
      : null,
  ].filter(Boolean) as string[];

  if (facts.length === 0) return null;

  return (
    <dl className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--demo-muted)]">
      {facts.map((fact) => (
        <div key={fact}>
          <dd>{fact}</dd>
        </div>
      ))}
    </dl>
  );
}

function RoomFeatures({ room }: { room: Room }) {
  if (!room.features || room.features.length === 0) return null;

  return (
    <ul className="mt-5 space-y-1.5 text-sm leading-relaxed">
      {room.features.map((feature) => (
        <li key={feature} className="flex gap-3">
          <span aria-hidden className="text-[var(--demo-accent)]">
            —
          </span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------- alternating */

/** Foto e texto trocam de lado a cada quarto, com folga grande entre eles. */
function AlternatingRooms({
  demo,
  rooms,
}: RoomsProps & { rooms: Room[] }) {
  return (
    <DemoSection id="quartos">
      <SectionHeading eyebrow="Acomodações" title="Onde dormir" />

      <div className="mt-12 space-y-[var(--demo-gap)]">
        {rooms.map((room, index) => (
          <article
            key={room.id}
            className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
          >
            {room.image ? (
              <DemoImage
                image={room.image}
                sizes="(max-width: 1024px) 100vw, 48vw"
                className={
                  index % 2 === 1
                    ? "w-full lg:order-2 lg:aspect-[5/4]"
                    : "w-full lg:aspect-[5/4]"
                }
              />
            ) : null}

            <div>
              <h3 className="demo-display text-[clamp(1.5rem,3.6vw,2.25rem)] leading-tight">
                {room.name}
              </h3>
              <p className="demo-prose mt-4 text-[0.975rem] leading-[1.75]">
                {room.description}
              </p>
              <RoomFacts room={room} />
              <RoomFeatures room={room} />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-14">
        <BookingLink href={demo.bookingUrl} tone="outline">
          Ver disponibilidade e tarifas
        </BookingLink>
      </div>
    </DemoSection>
  );
}

/* -------------------------------------------------------------- full-width */

/** Cada quarto é uma faixa: foto larga em cima, dados em três colunas embaixo. */
function FullWidthRooms({ demo, rooms }: RoomsProps & { rooms: Room[] }) {
  return (
    <DemoSection id="quartos" bleed>
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="Acomodações" />
      </div>

      <div className="mt-10 space-y-16">
        {rooms.map((room) => (
          <article key={room.id}>
            {room.image ? (
              <DemoImage
                image={room.image}
                sizes="100vw"
                className="h-[38vh] w-full min-h-[220px] sm:h-[56vh]"
              />
            ) : null}

            <div className="mx-auto mt-7 grid max-w-6xl gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)] lg:gap-12">
              <h3 className="demo-display text-[clamp(1.4rem,3vw,2rem)] uppercase leading-tight tracking-tight">
                {room.name}
              </h3>
              <div>
                <p className="text-[0.95rem] leading-[1.7]">
                  {room.description}
                </p>
                <RoomFacts room={room} />
              </div>
              <RoomFeatures room={room} />
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-6xl px-5 sm:px-8">
        <BookingLink href={demo.bookingUrl} tone="solid">
          Ver disponibilidade
        </BookingLink>
      </div>
    </DemoSection>
  );
}

/* --------------------------------------------------------------------- grid */

function GridRooms({ demo, rooms }: RoomsProps & { rooms: Room[] }) {
  return (
    <DemoSection id="quartos">
      <SectionHeading eyebrow="Acomodações" />

      <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2">
        {rooms.map((room) => (
          <article key={room.id}>
            {room.image ? (
              <DemoImage
                image={room.image}
                sizes="(max-width: 640px) 100vw, 45vw"
                className="aspect-[4/3] w-full"
              />
            ) : null}
            <h3 className="demo-display mt-5 text-xl leading-tight">
              {room.name}
            </h3>
            <p className="mt-3 text-[0.95rem] leading-[1.7]">
              {room.description}
            </p>
            <RoomFacts room={room} />
            <RoomFeatures room={room} />
          </article>
        ))}
      </div>

      <div className="mt-12">
        <BookingLink href={demo.bookingUrl} tone="outline">
          Ver disponibilidade
        </BookingLink>
      </div>
    </DemoSection>
  );
}
