export type Transmission = "manual" | "automatic" | "cvt" | "automated";
export type Fuel = "flex" | "gasoline" | "diesel" | "hybrid" | "electric";

export type VehicleStatus =
  | "draft"
  | "awaiting_photos"
  | "active"
  | "reserved"
  | "sold"
  | "inactive";

/** Origem da entrada do veículo na loja. */
export type AcquisitionSource = "own_purchase" | "consignment" | "trade_in";

/** Fase de preparação interna — eixo ortogonal ao status comercial. */
export type PreparationStatus = "none" | "in_preparation" | "ready";

export type PhotoSlotKey =
  // required
  | "front"
  | "rear"
  | "side_left"
  | "side_right"
  | "dashboard"
  | "front_seats"
  | "rear_seats"
  | "trunk"
  // recommended
  | "engine"
  | "wheels"
  | "tires"
  | "keys"
  | "multimedia"
  | "interior_detail"
  // optional
  | "damage"
  | "exterior_detail"
  | "document";

export interface PhotoSlotDefinition {
  key: PhotoSlotKey;
  label: string;
  group: "required" | "recommended" | "optional";
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  storagePath: string;
  position?: PhotoSlotKey;
  label?: string;
  isRequired: boolean;
  isRecommended: boolean;
  isMain: boolean;
  sortOrder: number;
}

export interface Vehicle {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: number;
  yearModel: number;
  price: number;
  mileage: number;
  transmission: Transmission;
  fuel: Fuel;
  color: string;
  doors: number;
  plateFinal?: string;
  features: string[];
  descriptionShort: string;
  descriptionFull: string;
  status: VehicleStatus;
  isFeatured: boolean;
  isPublished: boolean;
  mainImage: string;
  images: VehicleImage[];
  qualityScore: number;
  acquiredAt?: string;
  acquisitionSource: AcquisitionSource;
  preparationStatus: PreparationStatus;
  createdAt: string;
  updatedAt: string;
}
