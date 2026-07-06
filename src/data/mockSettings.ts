import type { DealershipSettings } from "@/types/settings";
import { brand } from "@/config/brand";

export const mockSettings: DealershipSettings = {
  name: brand.name,
  address: brand.address,
  whatsapp: brand.whatsapp,
  whatsappDisplay: brand.whatsappDisplay,
  instagram: brand.instagram,
  facebook: brand.facebook,
  googleMapsUrl: brand.googleMapsUrl,
  googleMapsEmbedUrl: brand.googleMapsEmbedUrl,
  openingHours: brand.openingHours,
  shortDescription: brand.shortDescription,
  fullDescription: brand.fullDescription,
};
