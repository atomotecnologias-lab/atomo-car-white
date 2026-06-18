import { mockLeads } from "@/data/mockLeads";
import type { Lead } from "@/types/lead";

export async function listLeads(): Promise<Lead[]> {
  return mockLeads;
}
