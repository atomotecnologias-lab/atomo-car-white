import type { Vehicle } from "@/types";
import { formatBRL, formatKm, formatYear } from "./format";

export function whatsappLink(phoneDigits: string, text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${phoneDigits}?text=${encoded}`;
}

export function vehicleInterestMessage(v: Vehicle): string {
  return [
    `Olá! Tenho interesse no ${v.brand} ${v.model} ${v.version} ${formatYear(v.yearManufacture, v.yearModel)}`,
    `${formatKm(v.mileage)} • ${v.color} • ${formatBRL(v.price)}`,
    `Pode me passar mais informações?`,
  ].join("\n");
}

export function generalMessage(): string {
  return "Olá! Vim pelo site da ToniKar e gostaria de mais informações.";
}
