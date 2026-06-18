import type { Vehicle } from "@/types";
import type { QualityCriterion, QualityScore } from "@/types/quality";

const REQUIRED_PHOTOS = 8;
const RECOMMENDED_PHOTOS = 6;

export function computeQualityScore(v: Vehicle): QualityScore {
  const hasCore =
    !!v.brand &&
    !!v.model &&
    !!v.version &&
    v.price > 0 &&
    v.mileage >= 0 &&
    !!v.color &&
    !!v.transmission &&
    !!v.fuel;

  const criteria: QualityCriterion[] = [
    { key: "core_data", label: "Dados principais completos", weight: 15, satisfied: hasCore },
    {
      key: "required_photos",
      label: "Fotos obrigatórias enviadas",
      weight: 25,
      satisfied: v.images.length >= REQUIRED_PHOTOS,
    },
    {
      key: "recommended_photos",
      label: "Fotos recomendadas enviadas",
      weight: 10,
      satisfied: v.images.length >= 1,
    },
    {
      key: "description_approved",
      label: "Descrição aprovada",
      weight: 10,
      satisfied: v.descriptionFull.length > 80,
    },
    {
      key: "features_reviewed",
      label: "Opcionais revisados",
      weight: 10,
      satisfied: v.features.length >= 3,
    },
    { key: "seo_generated", label: "SEO gerado", weight: 5, satisfied: v.descriptionShort.length > 0 },
    {
      key: "post_texts_generated",
      label: "Textos de postagem gerados",
      weight: 10,
      satisfied: v.descriptionFull.length > 80,
    },
    { key: "published", label: "Publicado no site", weight: 10, satisfied: v.isPublished },
    {
      key: "whatsapp_contextual",
      label: "WhatsApp contextual configurado",
      weight: 5,
      satisfied: true,
    },
  ];

  const total = criteria.reduce((acc, c) => acc + (c.satisfied ? c.weight : 0), 0);
  return { total, criteria };
}
