export type LeadStatus =
  | "new"
  | "contacted"
  | "negotiating"
  | "proposal"
  | "financing"
  | "sold"
  | "lost";
export type LeadSource =
  | "site_vehicle"
  | "site_form"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "google"
  | "other";

export interface Lead {
  id: string;
  vehicleId?: string;
  name: string;
  phone: string;
  source: LeadSource;
  message: string;
  status: LeadStatus;
  createdAt: string;
  lastContactAt?: string;
}
