import type { Vehicle } from "@/types";
import type { AssistedContent } from "@/types/content";
import { formatBRL, formatKm, formatYear, fuelLabel, transmissionLabel } from "./format";

/**
 * Templates determinísticos. Não é IA — é geração assistida baseada
 * estritamente nos campos do veículo. Sempre marcada como "sugestão".
 */
export function generateAssistedContent(v: Vehicle): AssistedContent[] {
  const fullName = `${v.brand} ${v.model} ${v.version}`;
  const year = formatYear(v.yearManufacture, v.yearModel);
  const price = formatBRL(v.price);
  const km = formatKm(v.mileage);
  const trans = transmissionLabel(v.transmission);
  const fuel = fuelLabel(v.fuel);

  const topFeatures = v.features.slice(0, 5).join(" • ");
  const hashtags = `#PrimosAutomoveis #JaraguaDoSul #${v.brand.replace(/\s+/g, "")} #${v.model.replace(/\s+/g, "")} #Seminovos`;

  return [
    {
      channel: "site_title",
      label: "Título comercial",
      text: `${fullName} ${year}`,
      approved: false,
    },
    {
      channel: "site_short",
      label: "Descrição curta",
      text: `${fullName} ${year} ${v.color}, ${trans}, ${fuel}, ${km}. Procedência verificada na Primos Automóveis.`,
      approved: false,
    },
    {
      channel: "site_full",
      label: "Descrição completa",
      text: `${fullName} ${year} na cor ${v.color}, câmbio ${trans.toLowerCase()}, motorização ${fuel.toLowerCase()}, com ${km}. Veículo selecionado pela Primos Automóveis em Jaraguá do Sul, com procedência verificada e laudo cautelar disponível.\n\nPrincipais itens: ${topFeatures || "diversos opcionais"}.\n\nAceitamos seu veículo na troca e auxiliamos no financiamento.`,
      approved: false,
    },
    {
      channel: "seo_title",
      label: "Título SEO",
      text: `${fullName} ${year} ${v.color} — ${price} | Primos Automóveis Jaraguá do Sul`,
      approved: false,
    },
    {
      channel: "seo_description",
      label: "Descrição SEO",
      text: `${fullName} ${year}, ${km}, ${trans}, ${fuel}, ${v.color}. ${price}. Procedência verificada na Primos Automóveis em Jaraguá do Sul - SC.`,
      approved: false,
    },
    {
      channel: "instagram",
      label: "Texto para Instagram",
      text: `🚗 ${fullName} ${year}\n\n• ${km}\n• ${trans} ${fuel}\n• Cor ${v.color}\n${topFeatures ? `• ${topFeatures}` : ""}\n\n💰 ${price}\n\nFale com a gente no WhatsApp. Aceitamos troca e financiamos.\n\n${hashtags}`,
      approved: false,
    },
    {
      channel: "facebook",
      label: "Texto para Facebook",
      text: `${fullName} ${year} disponível na Primos Automóveis.\n\n${km} • ${trans} • ${fuel} • ${v.color}\n${topFeatures ? `Itens: ${topFeatures}.` : ""}\n\nValor: ${price}.\n\nFinanciamos e aceitamos seu veículo na troca. Chame no WhatsApp.`,
      approved: false,
    },
    {
      channel: "google_business",
      label: "Texto para Google Perfil da Empresa",
      text: `Novidade no estoque: ${fullName} ${year}, ${km}, ${trans.toLowerCase()}, ${v.color}. ${price}. Atendimento humano, procedência verificada, financiamento e troca.`,
      approved: false,
    },
    {
      channel: "olx",
      label: "Texto para OLX",
      text: `${fullName} ${year}\n\nQuilometragem: ${km}\nCâmbio: ${trans}\nCombustível: ${fuel}\nCor: ${v.color}\nPortas: ${v.doors}\n\nItens: ${topFeatures || "—"}.\n\nVeículo de procedência, revisado. Aceitamos troca e financiamos.`,
      approved: false,
    },
    {
      channel: "webmotors",
      label: "Texto para Webmotors",
      text: `${fullName} ${year} • ${km} • ${trans} • ${fuel} • ${v.color}. Itens: ${topFeatures || "diversos"}. Procedência Primos Automóveis.`,
      approved: false,
    },
    {
      channel: "whatsapp",
      label: "Mensagem para WhatsApp",
      text: `Olá! Temos disponível o ${fullName} ${year}, ${v.color}, ${km}, ${trans.toLowerCase()}. Valor ${price}. Posso te enviar mais fotos e condições?`,
      approved: false,
    },
    {
      channel: "selling_points",
      label: "Argumentos comerciais",
      text: `• Procedência verificada\n• Revisado pela equipe Primos\n• Aceita troca\n• Financiamento facilitado\n• Atendimento em Jaraguá do Sul`,
      approved: false,
    },
    {
      channel: "common_questions",
      label: "Respostas para dúvidas comuns",
      text: `Aceita troca? Sim, avaliamos seu veículo.\nFinancia? Sim, trabalhamos com diversos bancos.\nTem laudo? Sim, laudo cautelar disponível.\nPode agendar visita? Sim, atendemos com hora marcada.`,
      approved: false,
    },
  ];
}
