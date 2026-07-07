export type TeamRole = "owner" | "seller";

export interface TeamMember {
  id: string;
  dealershipId: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  role: TeamRole;
  isActive: boolean;
  createdAt: string;
}
