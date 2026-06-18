export type ContentChannel =
  | "site_title"
  | "site_short"
  | "site_full"
  | "seo_title"
  | "seo_description"
  | "instagram"
  | "facebook"
  | "google_business"
  | "olx"
  | "webmotors"
  | "whatsapp"
  | "selling_points"
  | "common_questions";

export interface AssistedContent {
  channel: ContentChannel;
  label: string;
  text: string;
  approved: boolean;
}
