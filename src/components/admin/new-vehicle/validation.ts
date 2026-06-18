import { PHOTO_SLOTS } from "@/data/photoSlots";
import { isValidPlate } from "@/lib/plate-lookup";
import type { FormState } from "./types";

export function validateAll(f: FormState) {
  const errs: Record<string, string[]> = {
    plate: [],
    mileage: [],
    identity: [],
    specs: [],
    price: [],
    features: [],
    photos: [],
    content: [],
    review: [],
  };

  if (!isValidPlate(f.plate)) errs.plate.push("Informe uma placa válida");

  if (!f.mileage || Number(f.mileage) < 0) errs.mileage.push("Informe a quilometragem do painel");

  if (!f.brand) errs.identity.push("Selecione a marca");
  if (!f.model.trim()) errs.identity.push("Informe o modelo");
  if (!f.version.trim()) errs.identity.push("Informe a versão");
  if (!f.yearManufacture) errs.identity.push("Ano de fabricação obrigatório");
  if (!f.yearModel) errs.identity.push("Ano modelo obrigatório");

  if (!f.transmission) errs.specs.push("Selecione o câmbio");
  if (!f.fuel) errs.specs.push("Selecione o combustível");
  if (!f.color.trim()) errs.specs.push("Informe a cor");

  if (!f.price || Number(f.price) <= 0) errs.price.push("Informe um preço válido");

  const requiredFilled = PHOTO_SLOTS.filter(
    (s) => s.group === "required" && f.photos[s.key],
  ).length;
  if (requiredFilled < 4)
    errs.photos.push(`Adicione pelo menos 4 fotos obrigatórias (${requiredFilled}/8)`);

  if (f.descriptionShort.trim().length < 20)
    errs.content.push("Descrição curta precisa de ao menos 20 caracteres");
  if (f.descriptionFull.trim().length < 80)
    errs.content.push("Descrição completa precisa de ao menos 80 caracteres");

  let pts = 0;
  if (errs.plate.length === 0) pts += 6;
  if (f.platePhoto) pts += 2;
  if (errs.mileage.length === 0) pts += 6;
  if (f.mileagePhoto) pts += 4;
  if (errs.identity.length === 0) pts += 14;
  if (errs.specs.length === 0) pts += 12;
  if (errs.price.length === 0) pts += 8;
  if (f.features.length >= 4) pts += 8;
  const allReq = PHOTO_SLOTS.filter((s) => s.group === "required").length;
  pts += Math.round((requiredFilled / allReq) * 24);
  if (errs.content.length === 0) pts += 12;
  if (f.isFeatured) pts += 2;
  if (f.mainPhotoKey) pts += 2;

  return { stepErrors: errs, completeness: Math.min(100, pts) };
}
