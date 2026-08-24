import type { LodgingDemo } from "../types/lodging-demo";

const CREDIT =
  "Ilustração de demonstração criada pela LLK — substituir pela fotografia oficial da casa.";

/**
 * Demo 2 — hospedagem costeira.
 *
 * Hospedagem inteiramente fictícia. Nome, endereço, preços e textos foram
 * escritos para esta apresentação e não descrevem nenhum estabelecimento real.
 *
 * Direção de arte oposta à demo da serra: hero fullscreen com a foto tomando a
 * tela, paleta mineral e salina, grotesca contemporânea em caixa alta, quartos
 * em faixas de largura total e fechamento tipográfico, sem foto.
 *
 * Também é o caso de teste das seções opcionais: esta demo não tem depoimentos
 * nem média de avaliações, e a página fecha sem lacuna por isso.
 */
export const casaDuna: LodgingDemo = {
  slug: "casa-duna",
  status: "demo",
  name: "Casa Duna",
  location: {
    city: "Enseada do Sereno",
    state: "SC",
    district: "Costão Sul",
    address: "Servidão das Corticeiras, 88",
  },
  tagline:
    "Sete quartos atrás da última duna, a 300 metros da arrebentação e fora do caminho dos carros.",
  description:
    "A casa é de 1998 e passou a maior parte da vida como residência de veraneio de uma família de Blumenau. Em 2022 trocamos as esquadrias por alumínio anodizado, tiramos as divisórias do térreo e abrimos sete quartos. Mantivemos o piso de cimento queimado, que aguenta pé de areia, e a pérgola de eucalipto que faz sombra no pátio depois das duas da tarde.",
  closingHeadline: "Casa Duna",
  bookingUrl: "https://reservas.example.com/casa-duna",
  whatsapp: "5548999990002",
  instagram: "casaduna.demo",

  images: [
    {
      src: "/demo/casa-duna/enseada.svg",
      alt: "Ilustração da enseada vista do alto da duna, com o mar aberto e a faixa de areia clara.",
      width: 1920,
      height: 1080,
      role: "hero",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/pergola.svg",
      alt: "Ilustração da pérgola de eucalipto no pátio, com a sombra riscando o piso de cimento.",
      width: 1400,
      height: 1000,
      role: "gallery",
      caption: "Pátio interno, três da tarde.",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/mare.svg",
      alt: "Ilustração da maré baixa deixando bancos de areia expostos na enseada.",
      width: 1400,
      height: 1000,
      role: "gallery",
      caption: "Maré baixa: dá para atravessar até o costão.",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/sal.svg",
      alt: "Ilustração do fim de tarde sobre a água, com o sol baixo e o mar em faixas.",
      width: 1200,
      height: 1500,
      role: "gallery",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/pateo.svg",
      alt: "Ilustração da fachada da casa, com o ritmo de pilares e a sombra da tarde.",
      width: 1200,
      height: 1500,
      role: "gallery",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/tarde.svg",
      alt: "Ilustração da sala comum, com a janela larga abrindo para a duna.",
      width: 1400,
      height: 1000,
      role: "gallery",
      caption: "Sala comum, com a janela que não fecha cortina.",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/vila.svg",
      alt: "Ilustração da vila de pescadores no fim da praia, vista da areia.",
      width: 1600,
      height: 1000,
      role: "destination",
      credit: CREDIT,
    },
    {
      src: "/demo/casa-duna/horizonte.svg",
      alt: "Ilustração do horizonte da enseada em luz plana de manhã cedo.",
      width: 1920,
      height: 900,
      role: "final-cta",
      credit: CREDIT,
    },
  ],

  rooms: [
    {
      id: "vento",
      name: "Vento Sul",
      description:
        "Fica na quina da casa e tem janela nas duas paredes. Quando entra vento sul não precisa de ventilador; quando não entra, precisa.",
      capacity: 2,
      size: 18,
      priceFrom: 380,
      features: [
        "Cama de casal, roupa de cama de algodão lavado",
        "Ventilador de teto",
        "Chuveiro de água quente e ducha externa de pés",
      ],
      image: {
        src: "/demo/casa-duna/quarto-vento.svg",
        alt: "Ilustração do quarto Vento Sul, com janelas em duas paredes e cama baixa.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
    {
      id: "agulha",
      name: "Agulha",
      description:
        "O quarto do fundo, mais escuro e mais silencioso, encostado no morro. É o único que não escuta o mar — e o preferido de quem dorme tarde.",
      capacity: 2,
      size: 15,
      priceFrom: 340,
      features: [
        "Cama de casal",
        "Sem janela para a rua",
        "Ar-condicionado",
      ],
      image: {
        src: "/demo/casa-duna/quarto-agulha.svg",
        alt: "Ilustração do quarto Agulha, com pouca luz e parede encostada no morro.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
    {
      id: "terraco",
      name: "Terraço",
      description:
        "Ocupa o segundo andar inteiro e tem saída para uma laje de 20 m² com vista para a duna. A escada é externa e fica exposta em dia de chuva.",
      capacity: 4,
      size: 38,
      priceFrom: 720,
      features: [
        "Cama de casal e duas camas de solteiro",
        "Laje privativa com rede e chuveiro",
        "Frigobar e pia",
      ],
      image: {
        src: "/demo/casa-duna/quarto-terraco.svg",
        alt: "Ilustração do terraço do segundo andar, com a laje aberta e a duna ao fundo.",
        width: 1600,
        height: 1100,
        credit: CREDIT,
      },
    },
  ],

  amenities: [
    {
      label: "Café da manhã das 8h às 11h",
      detail: "Servido no pátio. Fruta da feira de quarta, pão da padaria da vila.",
    },
    {
      label: "Ducha de areia na entrada",
      detail: "Regra da casa: ninguém sobe a escada com pé de areia.",
    },
    {
      label: "Duas pranchas de bodyboard e um caiaque",
      detail: "Emprestados por ordem de chegada, no depósito ao lado da ducha.",
    },
    {
      label: "Wi‑Fi em toda a casa",
      detail: "Fibra de 300 Mb. Funciona para chamada de vídeo.",
    },
    {
      label: "Estacionamento a 80 m",
      detail: "Terreno cercado, na entrada da servidão. A casa não tem garagem.",
    },
    {
      label: "Sem recepção 24 horas",
      detail: "Chegadas depois das 21h combinadas por mensagem, com fechadura eletrônica.",
    },
  ],

  attractions: [
    {
      name: "Costão do Sereno",
      description:
        "Ponta de pedra no fim da praia, atravessável na maré baixa. Tem poças fundas com peixe pequeno.",
      distance: "1,2 km pela areia",
    },
    {
      name: "Vila dos pescadores",
      description:
        "Seis ranchos ainda em uso. Peixe fresco a partir das 7h, quando o barco volta. Pagamento em dinheiro.",
      distance: "15 min a pé",
    },
    {
      name: "Trilha da Lagoinha",
      description:
        "Trilha de 50 minutos por dentro da restinga até uma lagoa de água escura. Sem sombra no trecho final.",
      distance: "saída a 600 m",
    },
    {
      name: "Feira de quarta",
      description:
        "Na quadra da escola, das 15h às 19h. Banana, camarão e pastel de camarão.",
      distance: "1,8 km",
    },
  ],

  faq: [
    {
      question: "Como se chega à casa?",
      answer:
        "A servidão é estreita e não dá para carro grande. Deixe o carro no terreno cercado da entrada (incluído na diária) e caminhe 80 metros até a porta. Mandamos a localização exata no dia anterior.",
    },
    {
      question: "Dá para ir com criança pequena?",
      answer:
        "Sim. Temos duas camas dobráveis e cadeirão. A casa tem escada externa sem portão, então o Terraço não é indicado para crianças que ainda não sobem escada sozinhas.",
    },
    {
      question: "Qual a melhor época?",
      answer:
        "De março a maio o mar fica mais limpo e a vila esvazia. Em janeiro a praia enche e a fila da padaria dobra. Entre junho e agosto chove menos, mas a água fica em torno de 17 °C.",
    },
    {
      question: "Aceitam animais?",
      answer:
        "Não. A casa é toda de piso corrido e compartilhamos o pátio e a sala entre os sete quartos.",
    },
  ],

  design: {
    mood: "coastal",
    density: "airy",
    hero: "fullscreen",
    gallery: "horizontal",
    rooms: "full-width",
    testimonials: "minimal",
    destination: "immersive",
    finalCta: "typographic",
    typography: "contemporary-sans",
    sectionOrder: [
      "rooms",
      "amenities",
      "gallery",
      "destination",
      "testimonials",
      "faq",
    ],
    palette: {
      background: "#f2f4f1",
      foreground: "#18211f",
      accent: "#0f4c4f",
      accentForeground: "#f2f4f1",
      muted: "#576663",
      surface: "#e3e8e3",
      rule: "#c9d1cc",
    },
  },

  provenance: {
    reviewedAt: "2026-08-24",
    notes: [
      "Conteúdo 100% fictício, escrito para demonstração comercial da LLK.",
      "Demo sem depoimentos e sem média de avaliações, de propósito: serve de teste das seções opcionais.",
    ],
  },
};
