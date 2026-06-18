import type { PhotoSlotDefinition } from "@/types/vehicle";

export const PHOTO_SLOTS: PhotoSlotDefinition[] = [
  // Obrigatórios
  { key: "front", label: "Frontal", group: "required" },
  { key: "rear", label: "Traseira", group: "required" },
  { key: "side_left", label: "Lateral esquerda", group: "required" },
  { key: "side_right", label: "Lateral direita", group: "required" },
  { key: "dashboard", label: "Painel", group: "required" },
  { key: "front_seats", label: "Bancos dianteiros", group: "required" },
  { key: "rear_seats", label: "Bancos traseiros", group: "required" },
  { key: "trunk", label: "Porta-malas", group: "required" },
  // Recomendados
  { key: "engine", label: "Motor", group: "recommended" },
  { key: "wheels", label: "Rodas", group: "recommended" },
  { key: "tires", label: "Pneus", group: "recommended" },
  { key: "keys", label: "Chave/manual", group: "recommended" },
  { key: "multimedia", label: "Central multimídia", group: "recommended" },
  { key: "interior_detail", label: "Detalhes internos", group: "recommended" },
  // Opcionais
  { key: "damage", label: "Avarias", group: "optional" },
  { key: "exterior_detail", label: "Detalhes externos", group: "optional" },
  { key: "document", label: "Documentação", group: "optional" },
];
