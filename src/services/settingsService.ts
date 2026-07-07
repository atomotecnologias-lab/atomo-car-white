import { mockSettings } from "@/data/mockSettings";
import type { DealershipSettings } from "@/types/settings";
import type { CommissionBase, CommissionConfig, CommissionType } from "@/types/sale";
import { supabase } from "@/lib/supabase";
import { getDealershipId } from "./dealershipService";

export async function getSettings(): Promise<DealershipSettings> {
  return mockSettings;
}

const DEFAULT_COMMISSION: CommissionConfig = { type: "percent", base: "sale", value: 1 };

/** Config de comissão da loja — fonte real (dealership_settings). */
export async function getCommissionConfig(): Promise<CommissionConfig> {
  const { data, error } = await supabase
    .from("dealership_settings")
    .select("commission_type, commission_base, commission_value")
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULT_COMMISSION;
  return {
    type: data.commission_type as CommissionType,
    base: data.commission_base as CommissionBase,
    value: Number(data.commission_value),
  };
}

export async function saveCommissionConfig(config: CommissionConfig): Promise<void> {
  const dealershipId = await getDealershipId();
  const { error } = await supabase.from("dealership_settings").upsert(
    {
      dealership_id: dealershipId,
      commission_type: config.type,
      commission_base: config.base,
      commission_value: config.value,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: "dealership_id" },
  );
  if (error) throw error;
}
