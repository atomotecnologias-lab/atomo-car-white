import type { DealershipSettings } from "@/types/settings";

export const mockSettings: DealershipSettings = {
  name: "Primos Automóveis",
  address: "Rua Roberto Ziemann, 3275 — Jaraguá do Sul, SC",
  whatsapp: "5547997592023",
  whatsappDisplay: "(47) 99759-2023",
  instagram: "https://www.instagram.com/primos_automoveislm/",
  facebook: "https://www.facebook.com/primosautomoveislm/",
  googleMapsUrl: "https://share.google/p7ObMXCFXWsP5WT2O",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Primos+Autom%C3%B3veis+Jaragu%C3%A1+do+Sul&output=embed",
  openingHours: [
    { label: "Segunda a sexta", value: "08h às 18h" },
    { label: "Sábado", value: "08h às 12h" },
    { label: "Domingo", value: "Fechado" },
  ],
  shortDescription:
    "Veículos selecionados, negociações transparentes e atendimento próximo em cada etapa da sua compra.",
  fullDescription:
    "A Primos Automóveis nasceu em 2018 em Jaraguá do Sul com o propósito de oferecer veículos seminovos e usados de procedência, com atendimento próximo e transparente. Trabalhamos com compra, venda, troca e financiamento, e construímos relacionamento com cada cliente.",
};
