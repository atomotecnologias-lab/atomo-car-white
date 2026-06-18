import { lookupPlateServer } from "./api/plate-lookup.functions";

export type PlateLookupResult = {
  plate: string;
  brand: string;
  model: string;
  version: string;
  yearManufacture: number;
  yearModel: number;
  color: string;
  fuel: "flex" | "gasoline" | "diesel" | "hybrid" | "electric";
};

function normalizePlate(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}

export function isValidPlate(raw: string): boolean {
  const p = normalizePlate(raw);
  // BR antiga: AAA9999 · Mercosul: AAA9A99
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p);
}

export function formatPlate(raw: string): string {
  const p = normalizePlate(raw);
  if (p.length <= 3) return p;
  return `${p.slice(0, 3)}-${p.slice(3)}`;
}

export async function lookupPlate(raw: string): Promise<PlateLookupResult> {
  if (!isValidPlate(raw)) throw new Error("Placa inválida");
  return lookupPlateServer({ data: { plate: normalizePlate(raw) } });
}
