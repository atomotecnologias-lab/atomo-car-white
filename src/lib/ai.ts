import type { Fuel, Transmission } from "@/types";
import {
  enrichVehicleServer,
  generateContentServer,
  suggestPriceServer,
  readPlateServer,
  readOdometerServer,
} from "./api/ai.functions";

export type EnrichResult = {
  version: string;
  transmission: Transmission | null;
  fuel: Fuel | null;
  doors: number | null;
  features: string[];
};

export type ContentResult = {
  descriptionShort: string;
  descriptionFull: string;
};

export type PriceResult = {
  min: number;
  max: number;
  suggested: number;
};

export async function enrichVehicle(input: {
  brand: string;
  model: string;
  version?: string;
  yearModel?: number;
}): Promise<EnrichResult> {
  return enrichVehicleServer({ data: input }) as Promise<EnrichResult>;
}

export async function generateContent(input: {
  brand: string;
  model: string;
  version?: string;
  yearModel?: number;
  mileage?: number;
  color?: string;
  transmission?: string;
  fuel?: string;
  features?: string[];
}): Promise<ContentResult> {
  return generateContentServer({ data: input }) as Promise<ContentResult>;
}

export async function suggestPrice(input: {
  brand: string;
  model: string;
  version?: string;
  yearModel?: number;
  mileage?: number;
}): Promise<PriceResult> {
  return suggestPriceServer({ data: input }) as Promise<PriceResult>;
}

// --- Leitura por foto (visão) ---------------------------------------------

/** Redimensiona/comprime a imagem no browser para um data URL JPEG leve. */
export async function fileToCompressedDataUrl(
  file: File,
  maxSide = 1280,
  quality = 0.8,
): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function readPlateFromImage(file: File): Promise<string> {
  const imageBase64 = await fileToCompressedDataUrl(file);
  const r = (await readPlateServer({ data: { imageBase64 } })) as { plate: string };
  return r.plate;
}

export async function readOdometerFromImage(file: File): Promise<number> {
  const imageBase64 = await fileToCompressedDataUrl(file);
  const r = (await readOdometerServer({ data: { imageBase64 } })) as { mileage: number };
  return r.mileage;
}
