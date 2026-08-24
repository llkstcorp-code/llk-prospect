import type { LodgingDemo } from "../types/lodging-demo";

const CREDIT =
  "Ilustração de demonstração criada pela LLK — substituir pela fotografia oficial da casa.";

/**
 * Demo 3 — antiga tulha de café.
 *
 * Serve a dois propósitos: é o ponto de partida para criar uma demo nova
 * (copie o arquivo e troque o conteúdo) e exercita as variantes de composição
 * que as outras duas não usam — hero `split`, galeria `editorial`, quartos em
 * `grid`, depoimentos `photographic`, destino `split` e CTA final `minimal`.
 *
 * Hospedagem inteiramente fictícia.
 */
export const pousadaTulha: LodgingDemo = {
  slug: "pousada-tulha",
  status: "demo",
  name: "Pousada Tulha",
  location: {
    city: "Cidade Fictícia",
    state: "MG",
    district: "Bairro da Represa",
    address: "Rodovia Vicinal do Cedro, km 3",
  },
  tagline:
    "Quatro quartos numa antiga tulha de café, entre a represa e a estrada velha.",
  description:
    "A tulha ficou vazia por dezoito anos depois que a fazenda parou de beneficiar café. Em 2019 fechamos o vão com esquadria de ferro, aproveitamos o piso de tábua corrida que ainda estava inteiro e abrimos quatro quartos no volume antigo. A horta que abastece o café da manhã ocupa o terreiro onde o café secava.",
  closingHeadline:
    "A represa fica a dez minutos a pé. O portão não tem tranca.",
  bookingUrl: "https://reservas.example.com/pousada-tulha",
  whatsapp: "5531999990003",
  instagram: "pousadatulha.demo",

  images: [
    {
      src: "/demo/pousada-tulha/campo.svg",
      alt: "Ilustração do campo aberto visto da pousada, com morros baixos e luz de fim de tarde.",
      width: 1600,
      height: 1067,
      role: "hero",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-tulha/alpendre.svg",
      alt: "Ilustração do alpendre da tulha, com o ritmo dos pilares de madeira e a sombra da tarde.",
      width: 1200,
      height: 1500,
      role: "gallery",
      caption: "O alpendre corre a fachada inteira da tulha.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-tulha/horta.svg",
      alt: "Ilustração da horta no antigo terreiro de secagem, com canteiros baixos.",
      width: 1400,
      height: 900,
      role: "gallery",
      caption: "A horta ocupa o terreiro onde o café secava.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-tulha/cozinha.svg",
      alt: "Ilustração da cozinha coletiva, com a janela larga sobre a bancada.",
      width: 1400,
      height: 1000,
      role: "gallery",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-tulha/tear.svg",
      alt: "Ilustração dos tapetes de tear pendurados na parede da sala.",
      width: 1200,
      height: 1200,
      role: "gallery",
      caption: "Tapetes tecidos no tear da Dona Ercília, no bairro.",
      credit: CREDIT,
    },
    {
      src: "/demo/pousada-tulha/represa.svg",
      alt: "Ilustração da represa vista da trilha, com a margem baixa e os morros ao fundo.",
      width: 1600,
      height: 1000,
      role: "destination",
      credit: CREDIT,
    },
  ],

  rooms: [
    {
      id: "varanda",
      name: "Varanda",
      description:
        "Abre direto para o alpendre. É o único quarto no nível do terreiro, sem escada, e o que mais escuta a estrada quando passa caminhão.",
      capacity: 2,
      size: 19,
      priceFrom: 340,
      features: ["Cama de casal", "Porta direta para o alpendre", "Sem degrau na entrada"],
      image: {
        src: "/demo/pousada-tulha/quarto-varanda.svg",
        alt: "Ilustração do quarto Varanda, com a porta abrindo para o alpendre.",
        width: 1400,
        height: 1050,
        credit: CREDIT,
      },
    },
    {
      id: "tulha",
      name: "Tulha",
      description:
        "Ocupa o vão original onde o café era estocado, com pé-direito de 4,20 m e a estrutura de madeira aparente. Aquece devagar em noite fria.",
      capacity: 3,
      size: 28,
      priceFrom: 460,
      features: [
        "Cama de casal e cama de solteiro",
        "Pé-direito de 4,20 m com estrutura aparente",
        "Aquecedor a óleo sob demanda",
      ],
      image: {
        src: "/demo/pousada-tulha/quarto-tulha.svg",
        alt: "Ilustração do quarto Tulha, com pé-direito alto e estrutura de madeira aparente.",
        width: 1400,
        height: 1050,
        credit: CREDIT,
      },
    },
    {
      id: "agua",
      name: "Casa d'Água",
      description:
        "Fica separado, na antiga casa de bombas, a 60 metros do corpo principal. Não tem vizinho de parede e é o único com cozinha.",
      capacity: 4,
      size: 41,
      priceFrom: 620,
      features: [
        "Cama de casal e sofá-cama para dois",
        "Cozinha equipada com fogão de quatro bocas",
        "Caminho de terra até a porta, sem iluminação",
      ],
      image: {
        src: "/demo/pousada-tulha/quarto-agua.svg",
        alt: "Ilustração da Casa d'Água, construção separada com alpendre próprio.",
        width: 1400,
        height: 1050,
        credit: CREDIT,
      },
    },
  ],

  amenities: [
    {
      label: "Café da manhã das 8h às 10h",
      detail: "Ovo da galinha da casa, geleia da fruta da época e pão de queijo.",
    },
    {
      label: "Cozinha coletiva liberada o dia todo",
      detail: "Com geladeira, fogão e o que sobrar da horta.",
    },
    {
      label: "Wi‑Fi só na sala e no alpendre",
      detail: "A parede da tulha tem 60 cm — o sinal não atravessa.",
    },
    {
      label: "Cães de qualquer porte",
      detail: "Combinar antes. Há duas cadelas soltas no terreiro.",
    },
    { label: "Estacionamento no terreiro, sem cobertura" },
  ],

  attractions: [
    {
      name: "Represa do Cedro",
      description:
        "Margem rasa de areia grossa, boa para entrar na água. Não tem quiosque nem salva-vidas.",
      distance: "10 min a pé",
    },
    {
      name: "Estrada velha do café",
      description:
        "Sete quilômetros de leito antigo, plano, entre eucaliptos. Dá para andar de bicicleta — temos duas.",
      distance: "sai do portão",
    },
    {
      name: "Armazém do Ceará",
      description:
        "Mercearia e bar no mesmo balcão desde 1974. Fecha às 19h e não abre domingo.",
      distance: "2,4 km",
    },
  ],

  testimonials: [
    {
      id: "clara",
      quote:
        "Cheguei achando que ia trabalhar remoto e descobri que o Wi‑Fi só pega na sala. Acabou sendo a melhor parte.",
      author: "Clara V.",
      context: "hospedou-se na Tulha em maio",
      image: {
        src: "/demo/pousada-tulha/mesa.svg",
        alt: "Ilustração da mesa comprida da sala, com a luz da janela atravessando.",
        width: 1500,
        height: 1000,
        credit: CREDIT,
      },
    },
    {
      id: "tiago",
      quote:
        "A Casa d'Água tem cozinha, então levamos comida e ficamos quatro dias sem sair do bairro. O caminho até lá é escuro mesmo — leve lanterna.",
      author: "Tiago e Nara",
      context: "Belo Horizonte, MG",
      image: {
        src: "/demo/pousada-tulha/trilha.svg",
        alt: "Ilustração do caminho de terra que liga o corpo principal à Casa d'Água.",
        width: 1500,
        height: 1000,
        credit: CREDIT,
      },
    },
  ],

  faq: [
    {
      question: "Como chega de carro?",
      answer:
        "São 3 km de vicinal asfaltada depois da saída da rodovia e mais 400 metros de terra batida, plana. Qualquer carro chega, inclusive depois de chuva.",
    },
    {
      question: "Serve almoço ou jantar?",
      answer:
        "Não. Servimos só o café da manhã. A cozinha coletiva fica liberada o dia todo e o Armazém do Ceará, a 2,4 km, serve prato feito até as 15h.",
    },
    {
      question: "Qual o mínimo de noites?",
      answer:
        "Duas noites em fins de semana e feriados. Durante a semana aceitamos uma noite.",
    },
  ],

  reviewSummary: { rating: 4.7, count: 34, source: "Google" },

  design: {
    mood: "warm",
    density: "balanced",
    hero: "split",
    gallery: "editorial",
    rooms: "grid",
    testimonials: "photographic",
    destination: "split",
    finalCta: "minimal",
    typography: "editorial-serif",
    sectionOrder: [
      "rooms",
      "gallery",
      "amenities",
      "testimonials",
      "destination",
      "faq",
    ],
    palette: {
      background: "#f3efe1",
      foreground: "#24261a",
      accent: "#5d6b32",
      accentForeground: "#f6f4e8",
      muted: "#5f6350",
      surface: "#e7e3d0",
      rule: "#cfcbb2",
    },
  },

  provenance: {
    reviewedAt: "2026-08-24",
    notes: [
      "Conteúdo 100% fictício, escrito para demonstração comercial da LLK.",
      "Exercita as variantes de composição não usadas pelas outras duas demos.",
    ],
  },
};
