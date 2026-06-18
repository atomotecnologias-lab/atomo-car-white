export type EventType =
  | "view"
  | "whatsapp_click"
  | "financing_click"
  | "trade_in_click"
  | "lead_created";

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  eventType: EventType;
  source?: string;
  createdAt: string;
}
