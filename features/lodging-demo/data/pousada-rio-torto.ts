import type { LodgingDemo } from "../types/lodging-demo";

const CREDIT =
  "Ilustração de demonstração criada pela LLK — substituir pela fotografia oficial da casa.";

/**
 * Demo 1 — refúgio de serra.
 *
 * Hospedagem inteiramente fictícia. Nome, endereço, preços, avaliações e
 * depoimentos foram escritos para esta apresentação e não descrevem nenhum
 * estabelecimento real.
 *
 * Direção de arte: quente e artesanal. Hero editorial (tipografia primeiro,
 * foto entrando de lado), paleta de barro e madeira, serifa com carga
 * editorial, quartos em composição alternada e fechamento fotográfico.
 */
export const pousadaRioTorto: LodgingDemo = {
  slug: "pousada-rio-torto",
  status: "demo",
  name: "Pousada Rio Torto",
  location: {
    city: "Vila Cambará",
    state: "MG",
    district: "Estrada do Rio Torto",
    address: "Estrada do Rio Torto, km 7",
  },
  tagline:
    "Cinco quartos numa casa de tropeiro de 1946, a 1.320 metros, onde o asfalto acaba.",
  description:
    "A casa foi comprada em 2016 com o telhado caindo e três anos de mato no pomar. Refizemos o madeiramento com peroba recuperada da estrutura antiga, mantivemos o fogão a lenha da cozinha original e abrimos cinco quartos — nem um a mais, porque o poço da nascente não daria conta. O café da manhã sai do mesmo fogão. O pão também.",
  closingHeadline:
    "Da varanda até o poço do rio são 400 metros de trilha. É o trajeto mais longo do seu dia aqui.",
  bookingUrl: "https://reservas.example.com/pousada-rio-torto",
  whatsapp: "5535999990001",

  images: [
    {
      src: "/demo/pousada-rio-torto/vale.svg",
      alt: "Ilustração do vale visto da pousada, com camadas de morros e neblina baixa ao amanhecer.",
      width: 1600,
      height: 1067,
      role: "hero",
      caption: "O vale às 6h40, da varanda de cima.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/neblina.svg",
      alt: "Ilustração da neblina descendo entre os morros no fim da tarde.",
      width: 1200,
      height: 1500,
      role: "gallery",
      caption: "Em junho a neblina sobe antes das cinco.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/varanda.svg",
      alt: "Ilustração da varanda da casa, com a luz da janela caindo sobre o piso de tábua larga.",
      width: 1400,
      height: 1000,
      role: "gallery",
      caption: "Varanda da frente, virada para o nascente.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/lareira.svg",
      alt: "Ilustração da sala com a lareira de pedra e o banco de madeira encostado na parede.",
      width: 1200,
      height: 1500,
      role: "gallery",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/ceramica.svg",
      alt: "Ilustração das louças de cerâmica esmaltada usadas no café da manhã.",
      width: 1200,
      height: 1200,
      role: "gallery",
      caption: "Louça queimada no forno da Dona Nair, aqui do bairro.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/cume.svg",
      alt: "Ilustração do cume da serra visto do fim da trilha do mirante.",
      width: 1400,
      height: 900,
      role: "gallery",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/estrada.svg",
      alt: "Ilustração da estrada de terra que leva à pousada, cortando o vale entre morros.",
      width: 1600,
      height: 1000,
      role: "destination",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-rio-torto/despedida.svg",
      alt: "Ilustração do vale ao entardecer, com o sol baixo atrás da última serra.",
      width: 1800,
      height: 1100,
      role: "final-cta",
      credit: CREDIT,
    },
  ],

  rooms: [
    {
      id: "fogao",
      name: "Quarto do Fogão",
      description:
        "Fica atrás da cozinha e divide a parede com o fogão a lenha, o que resolve o frio da madrugada sem aquecedor. É o menor da casa e o mais quente.",
      capacity: 2,
      size: 16,
      priceFrom: 420,
      features: [
        "Cama de casal com edredom de pena",
        "Banheiro privativo com chuveiro a gás",
        "Janela para o pomar",
      ],
      image: {
        src: "/demo/pousada-rio-torto/quarto-fogao.svg",
        alt: "Ilustração do quarto do fogão, com a cama baixa e a janela voltada para o pomar.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
    {
      id: "sotao",
      name: "Sótão",
      description:
        "Ocupa o telhado inteiro da ala antiga. O pé-direito baixa nas laterais — quem tem mais de 1,85 m encosta a cabeça de um lado. A claraboia dá para o céu limpo do vale.",
      capacity: 3,
      size: 24,
      priceFrom: 560,
      features: [
        "Cama de casal e cama de solteiro",
        "Claraboia sobre a cama",
        "Escada íngreme de acesso, sem elevador",
      ],
      image: {
        src: "/demo/pousada-rio-torto/quarto-sotao.svg",
        alt: "Ilustração do sótão, com a claraboia iluminando o piso de madeira e o teto inclinado.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
    {
      id: "pomar",
      name: "Pomar",
      description:
        "Foi construído em 2021, separado da casa, com entrada própria pelo quintal. Tem a única banheira da pousada, de cimento queimado, encostada na janela.",
      capacity: 2,
      size: 32,
      priceFrom: 690,
      features: [
        "Entrada independente pelo pomar",
        "Banheira de cimento queimado",
        "Lareira a lenha no quarto",
      ],
      image: {
        src: "/demo/pousada-rio-torto/quarto-pomar.svg",
        alt: "Ilustração do quarto do pomar, com a banheira encostada na janela e a lareira ao lado.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
  ],

  amenities: [
    {
      label: "Café da manhã das 7h30 às 10h",
      detail:
        "Pão de fubá assado no fogão a lenha, queijo curado do sítio vizinho e café coado na hora.",
    },
    {
      label: "Jantar às quintas e sábados",
      detail: "Menu único, reservado até as 15h do mesmo dia. R$ 95 por pessoa.",
    },
    { label: "Lareira acesa de abril a setembro" },
    {
      label: "Wi‑Fi na sala e na varanda",
      detail: "Não alcança os quartos. É de propósito.",
    },
    {
      label: "Cães até 15 kg",
      detail: "Combinar antes da reserva. Não subimos com cães no sótão.",
    },
    {
      label: "Estacionamento na frente da casa",
      detail: "Seis vagas descobertas. Carro baixo sofre nos últimos 3 km.",
    },
  ],

  attractions: [
    {
      name: "Poço do Rio Torto",
      description:
        "Poço fundo de água escura, com laje para deitar. A trilha sai do fundo do pomar e é sinalizada com estacas de bambu.",
      distance: "400 m a pé",
    },
    {
      name: "Mirante da Pedra Rachada",
      description:
        "Subida de 40 minutos com dois trechos de mão. De lá se vê o vale inteiro e, em dia limpo, a serra vizinha.",
      distance: "2,1 km a pé",
    },
    {
      name: "Feira de Vila Cambará",
      description:
        "Sábados de manhã, na praça da igreja. Queijo, cachaça de alambique e mudas. Acaba às 11h.",
      distance: "12 min de carro",
    },
    {
      name: "Alambique do Sr. Onofre",
      description:
        "Visita guiada de uma hora, com prova no fim. Só de terça a sexta, e é preciso avisar na véspera.",
      distance: "9 km pela estrada de terra",
    },
  ],

  testimonials: [
    {
      id: "helena",
      quote:
        "Dormi com a janela aberta as três noites. O barulho é o rio e nada mais. Na segunda manhã aprendi a acender o fogão sozinha.",
      author: "Helena M.",
      context: "hospedou-se no Sótão em julho",
    },
    {
      id: "rafael",
      quote:
        "Avisaram no WhatsApp que o carro baixo ia raspar e recomendaram deixar na entrada do bairro. Estavam certos, e alguém veio buscar a gente.",
      author: "Rafael e Bia",
      context: "Campinas, SP",
    },
  ],

  faq: [
    {
      question: "Como está a estrada?",
      answer:
        "Os últimos 7 km são de terra, sem asfalto. Em tempo seco qualquer carro sobe devagar. Depois de chuva forte, só com tração ou carro alto — mandamos uma foto da estrada no dia da chegada se você pedir.",
    },
    {
      question: "Tem sinal de celular?",
      answer:
        "Vivo pega fraco na varanda de cima. As outras operadoras não pegam. O Wi‑Fi da sala funciona para mensagens e chamadas de voz.",
    },
    {
      question: "Qual o mínimo de noites?",
      answer:
        "Duas noites em fins de semana comuns e três em feriados. Durante a semana aceitamos uma noite.",
    },
    {
      question: "Recebem crianças?",
      answer:
        "Sim, a partir de 8 anos. A casa tem escada íngreme, poço fundo perto e fogão a lenha aceso — não temos estrutura para crianças menores.",
    },
    {
      question: "Como funciona o cancelamento?",
      answer:
        "Devolução integral até 14 dias antes da chegada e de 50% até 7 dias. Depois disso não há reembolso, mas a data pode ser remarcada uma vez em até seis meses.",
    },
  ],

  reviewSummary: { rating: 4.9, count: 87, source: "Google" },

  design: {
    mood: "rustic",
    density: "balanced",
    hero: "editorial",
    gallery: "masonry",
    rooms: "alternating",
    testimonials: "quote",
    destination: "editorial",
    finalCta: "photographic",
    typography: "editorial-serif",
    sectionOrder: [
      "gallery",
      "rooms",
      "destination",
      "amenities",
      "testimonials",
      "faq",
    ],
    palette: {
      background: "#f4ece0",
      foreground: "#2a201a",
      accent: "#8a4b2a",
      accentForeground: "#faf5ee",
      muted: "#6b5949",
      surface: "#e9dccb",
      rule: "#d5c4ae",
    },
  },

  provenance: {
    reviewedAt: "2026-08-24",
    notes: [
      "Conteúdo 100% fictício, escrito para demonstração comercial da LLK.",
      "Nenhum dado de estabelecimento real foi utilizado.",
    ],
  },
};
