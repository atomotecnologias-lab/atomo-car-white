export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "pay"
  | "unpay"
  | "undo"
  | "status";

export type AuditEntity = "sale" | "cost" | "acquisition" | "entry" | "vehicle";

export interface ActivityEntry {
  id: string;
  actorName: string;
  action: AuditAction;
  entityType: AuditEntity;
  entityId?: string;
  vehicleId?: string;
  summary: string;
  createdAt: string;
}
