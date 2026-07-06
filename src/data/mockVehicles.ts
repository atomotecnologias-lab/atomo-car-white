import type { Vehicle, VehicleImage } from "@/types/vehicle";
import { PHOTO_SLOTS } from "./photoSlots";

import vwUp from "@/assets/stock/vw-up-2015.jpg.asset.json";
import hondaCity from "@/assets/stock/honda-city-2020.jpg.asset.json";
import chevroletCelta from "@/assets/stock/chevrolet-celta-2010.jpg.asset.json";
import fordKa from "@/assets/stock/ford-ka-2020.jpg.asset.json";
import nissanKicks from "@/assets/stock/nissan-kicks-2018.jpg.asset.json";
import hyundaiHb20 from "@/assets/stock/hyundai-hb20-2024.jpg.asset.json";
import jeepRenegade from "@/assets/stock/jeep-renegade-2021.jpg.asset.json";

function buildImages(vehicleId: string, urls: string[]): VehicleImage[] {
  return urls.map((url, idx) => {
    const slot = PHOTO_SLOTS[idx];
    return {
      id: `${vehicleId}-img-${idx + 1}`,
      vehicleId,
      url,
      storagePath: "",
      position: slot?.key,
      label: slot?.label,
      isRequired: slot?.group === "required",
      isRecommended: slot?.group === "recommended",
      isMain: idx === 0,
      sortOrder: idx,
    };
  });
}

function mkVehicle(
  v: Omit<Vehicle, "images" | "qualityScore" | "createdAt" | "updatedAt"> & {
    extraPhotos?: string[];
  },
): Vehicle {
  const photoUrls = v.extraPhotos ?? [v.mainImage];
  const images = buildImages(v.id, photoUrls);
  return {
    ...v,
    images,
    qualityScore: 0, // recomputed by service
    createdAt: "2026-05-20T12:00:00Z",
    updatedAt: "2026-05-25T09:00:00Z",
  };
}

/**
 * Estoque de demonstração — Atomo Car.
 */
export const mockVehicles: Vehicle[] = [
  mkVehicle({
    id: "v001",
    slug: "jeep-renegade-longitude-1-8-2021-v001",
    brand: "Jeep",
    model: "Renegade",
    version: "Longitude 1.8",
    yearManufacture: 2021,
    yearModel: 2021,
    price: 109900,
    mileage: 62400,
    transmission: "automatic",
    fuel: "flex",
    color: "Branco",
    doors: 4,
    plateFinal: "7",
    features: [
      "Câmbio automático",
      "Faróis de LED",
      "Rodas de liga leve aro 18",
      "Multimídia com Android Auto / CarPlay",
      "Câmera de ré",
      "Sensor de estacionamento",
      "Controle de cruzeiro",
      "Bancos em couro",
      "Ar-condicionado dual zone",
    ],
    descriptionShort:
      "Jeep Renegade Longitude 1.8 2021 branco, automático, único dono.",
    descriptionFull:
      "Jeep Renegade Longitude 1.8 2021/2021 na cor branca, câmbio automático, flex, com 62.400 km. Único dono, todas as revisões em concessionária, laudo cautelar aprovado. Aceitamos troca e auxiliamos no financiamento.",
    status: "active",
    isFeatured: true,
    isPublished: true,
    mainImage: jeepRenegade.url,
  }),
  mkVehicle({
    id: "v002",
    slug: "honda-city-personal-1-5-2020-v002",
    brand: "Honda",
    model: "City",
    version: "Personal 1.5",
    yearManufacture: 2020,
    yearModel: 2020,
    price: 89900,
    mileage: 71200,
    transmission: "cvt",
    fuel: "flex",
    color: "Preto",
    doors: 4,
    plateFinal: "3",
    features: [
      "Câmbio CVT",
      "Multimídia",
      "Câmera de ré",
      "Sensor de estacionamento",
      "Faróis de neblina",
      "Bancos em tecido premium",
      "Controle de tração e estabilidade",
      "Direção elétrica",
    ],
    descriptionShort: "Honda City Personal 1.5 2020 preto, CVT, segundo dono.",
    descriptionFull:
      "Honda City Personal 1.5 2020/2020 preto, câmbio CVT, flex, com 71.200 km. Segundo dono, revisões realizadas, ótimo estado de conservação.",
    status: "active",
    isFeatured: true,
    isPublished: true,
    mainImage: hondaCity.url,
  }),
  mkVehicle({
    id: "v003",
    slug: "nissan-kicks-sl-2018-v003",
    brand: "Nissan",
    model: "Kicks",
    version: "SL 1.6",
    yearManufacture: 2018,
    yearModel: 2018,
    price: 86900,
    mileage: 84500,
    transmission: "cvt",
    fuel: "flex",
    color: "Vermelho",
    doors: 4,
    plateFinal: "1",
    features: [
      "Câmbio CVT",
      "Direção elétrica",
      "Multimídia",
      "Câmera 360º",
      "Chave presencial",
      "Bancos em couro",
      "Rodas de liga leve",
      "Faróis de LED",
    ],
    descriptionShort: "Nissan Kicks SL 2018 vermelho, CVT, câmera 360º.",
    descriptionFull:
      "Nissan Kicks SL 2018/2018 vermelho, câmbio CVT, flex, com 84.500 km. Segundo dono, chave presencial, câmera 360º, multimídia, bancos em couro.",
    status: "active",
    isFeatured: true,
    isPublished: true,
    mainImage: nissanKicks.url,
  }),
  mkVehicle({
    id: "v004",
    slug: "hyundai-hb20-comfort-2024-v004",
    brand: "Hyundai",
    model: "HB20",
    version: "Comfort 1.0",
    yearManufacture: 2024,
    yearModel: 2024,
    price: 74900,
    mileage: 18700,
    transmission: "manual",
    fuel: "flex",
    color: "Prata",
    doors: 4,
    plateFinal: "5",
    features: [
      "Câmbio manual",
      "Direção elétrica",
      "Multimídia",
      "Comandos de som no volante",
      "Controle de estabilidade e tração",
      "Ar-condicionado",
      "Vidros e travas elétricos",
    ],
    descriptionShort: "Hyundai HB20 Comfort 2024 prata, manual, baixíssima km.",
    descriptionFull:
      "Hyundai HB20 Comfort 1.0 2024/2024 prata, câmbio manual, flex, com 18.700 km. Garantia de fábrica vigente, único dono.",
    status: "active",
    isFeatured: true,
    isPublished: true,
    mainImage: hyundaiHb20.url,
  }),
  mkVehicle({
    id: "v005",
    slug: "ford-ka-se-1-0-2020-v005",
    brand: "Ford",
    model: "Ka",
    version: "SE 1.0",
    yearManufacture: 2020,
    yearModel: 2020,
    price: 58900,
    mileage: 67800,
    transmission: "manual",
    fuel: "flex",
    color: "Cinza",
    doors: 4,
    plateFinal: "9",
    features: [
      "Câmbio manual",
      "Direção hidráulica",
      "Multimídia SYNC",
      "Ar-condicionado",
      "Vidros e travas elétricos",
      "Rodas de liga leve",
    ],
    descriptionShort: "Ford Ka SE 1.0 2020 cinza, manual, econômico.",
    descriptionFull:
      "Ford Ka SE 1.0 2020/2020 cinza, câmbio manual, flex, com 67.800 km. Revisões em dia, ótimo carro para o dia a dia.",
    status: "active",
    isFeatured: false,
    isPublished: true,
    mainImage: fordKa.url,
  }),
  mkVehicle({
    id: "v006",
    slug: "volkswagen-up-move-1-0-2015-v006",
    brand: "Volkswagen",
    model: "Up!",
    version: "Move 1.0",
    yearManufacture: 2015,
    yearModel: 2015,
    price: 39900,
    mileage: 98200,
    transmission: "manual",
    fuel: "flex",
    color: "Branco",
    doors: 4,
    plateFinal: "2",
    features: [
      "Câmbio manual",
      "Direção hidráulica",
      "Ar-condicionado",
      "Vidros e travas elétricos",
      "Computador de bordo",
      "Som original",
    ],
    descriptionShort: "VW Up! Move 1.0 2015 branco, manual, econômico.",
    descriptionFull:
      "Volkswagen Up! Move 1.0 2015/2015 branco, câmbio manual, flex, com 98.200 km. Carro de baixo custo de manutenção, ideal para uso urbano.",
    status: "active",
    isFeatured: false,
    isPublished: true,
    mainImage: vwUp.url,
  }),
  mkVehicle({
    id: "v007",
    slug: "chevrolet-celta-life-ls-1-0-2010-v007",
    brand: "Chevrolet",
    model: "Celta",
    version: "Life LS 1.0",
    yearManufacture: 2010,
    yearModel: 2010,
    price: 21900,
    mileage: 142300,
    transmission: "manual",
    fuel: "flex",
    color: "Prata",
    doors: 4,
    plateFinal: "4",
    features: [
      "Câmbio manual",
      "Direção mecânica",
      "Vidros elétricos dianteiros",
      "Trio elétrico",
      "Som original",
    ],
    descriptionShort: "Chevrolet Celta Life LS 1.0 2010 prata, manual.",
    descriptionFull:
      "Chevrolet Celta Life LS 1.0 2010/2010 prata, câmbio manual, flex, com 142.300 km. Excelente custo-benefício, documentação em dia.",
    status: "sold",
    isFeatured: false,
    isPublished: true,
    mainImage: chevroletCelta.url,
  }),
];
