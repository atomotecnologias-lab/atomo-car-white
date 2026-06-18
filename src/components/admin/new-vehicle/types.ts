import type { Fuel, PhotoSlotKey, Transmission, VehicleStatus } from "@/types";
import type { StepDef } from "@/components/admin/stepper/Stepper";

export type FormState = {
  plate: string;
  platePhoto: string;
  plateLookupDone: boolean;
  mileagePhoto: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: string;
  yearModel: string;
  mileage: string;
  transmission: Transmission | "";
  fuel: Fuel | "";
  color: string;
  doors: string;
  price: string;
  status: VehicleStatus;
  isFeatured: boolean;
  features: string[];
  photos: Partial<Record<PhotoSlotKey, string>>;
  photoFiles: Partial<Record<PhotoSlotKey, File>>;
  mainPhotoKey: PhotoSlotKey | "";
  descriptionShort: string;
  descriptionFull: string;
};

export type StepProps = {
  form: FormState;
  set: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
};

export const INITIAL: FormState = {
  plate: "",
  platePhoto: "",
  plateLookupDone: false,
  mileagePhoto: "",
  brand: "",
  model: "",
  version: "",
  yearManufacture: "",
  yearModel: "",
  mileage: "",
  transmission: "",
  fuel: "",
  color: "",
  doors: "4",
  price: "",
  status: "draft",
  isFeatured: false,
  features: [],
  photos: {},
  photoFiles: {},
  mainPhotoKey: "",
  descriptionShort: "",
  descriptionFull: "",
};

export const STEPS: StepDef[] = [
  { key: "plate", label: "Placa", description: "Foto ou digitação · consulta automática" },
  { key: "mileage", label: "Quilometragem", description: "Leitura do painel" },
  { key: "identity", label: "Identificação", description: "Confirme marca, modelo e ano" },
  { key: "specs", label: "Especificações", description: "Câmbio, combustível, cor" },
  { key: "price", label: "Preço & destaque", description: "Valor e visibilidade" },
  { key: "features", label: "Opcionais", description: "Itens de série e extras" },
  { key: "photos", label: "Fotos", description: "Diagrama posicional" },
  { key: "content", label: "Conteúdo", description: "Descrições para anúncio" },
  { key: "review", label: "Revisão", description: "Confirmar e publicar" },
];
