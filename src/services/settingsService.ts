import { mockSettings } from "@/data/mockSettings";
import type { DealershipSettings } from "@/types/settings";

export async function getSettings(): Promise<DealershipSettings> {
  return mockSettings;
}
