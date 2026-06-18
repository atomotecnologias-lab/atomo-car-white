export interface DealershipSettings {
  name: string;
  address: string;
  whatsapp: string; // E.164 sem +, ex 5547999999999
  whatsappDisplay: string;
  instagram: string;
  facebook: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  openingHours: { label: string; value: string }[];
  shortDescription: string;
  fullDescription: string;
}
