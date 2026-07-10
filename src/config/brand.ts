export const brand = {
  name: "ToniKar",
  cockpitName: "ToniKar Cockpit",
  shortDescription:
    "Veículos selecionados, negociações transparentes e atendimento dedicado em cada etapa da sua compra.",
  fullDescription:
    "A ToniKar nasceu com o propósito de oferecer veículos seminovos e usados de procedência, com atendimento próximo e transparente. Trabalhamos com compra, venda, troca e financiamento, e construímos relacionamento com cada cliente.",
  address: "Av. das Nações, 1000 — Centro, Jaraguá do Sul, SC",
  city: "Jaraguá do Sul — SC",
  whatsapp: "5511999999999",
  whatsappDisplay: "(11) 99999-9999",
  instagram: "https://www.instagram.com/tonikar/",
  facebook: "https://www.facebook.com/tonikar/",
  googleMapsUrl: "https://maps.google.com",
  googleMapsEmbedUrl: "https://www.google.com/maps?q=São+Paulo+SP&output=embed",
  logoUrl: "/atomo-car-logo.svg",
  seo: {
    title: "ToniKar — Seminovos selecionados",
    description:
      "ToniKar: seminovos e usados com procedência. Compra, venda, troca e financiamento com atendimento transparente.",
    author: "ToniKar",
    siteName: "ToniKar",
  },
  hashtags: [
    "#ToniKar",
    "#EstoqueAutomotivo",
    "#Seminovos",
    "#VendaDeVeiculos",
    "#GestaoAutomotiva",
  ],
  openingHours: [
    { label: "Segunda a sexta", value: "08h às 18h" },
    { label: "Sábado", value: "08h às 12h" },
    { label: "Domingo", value: "Fechado" },
  ],
  contactTemplates: {
    generalMessage: "Olá! Vim pelo site da ToniKar e gostaria de mais informações.",
    vehicleInterest: (brand: string, model: string) =>
      `Olá! Tenho interesse no ${brand} ${model}. Pode me passar mais informações?`,
  },
} as const;
