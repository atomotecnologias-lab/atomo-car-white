import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { CostType, VehicleAcquisition, VehicleCost, VehicleFinancials } from '@/types/finance'
import { formatBRLExact } from '@/lib/format'
import { getDealershipId } from './dealershipService'
import { logActivity } from './auditService'

const COST_LABEL: Record<CostType, string> = {
  washing: 'Lavagem',
  bodywork: 'Funilaria',
  painting: 'Pintura',
  mechanical: 'Mecânica',
  documentation: 'Documentação',
  accessories: 'Acessórios',
  other: 'Outros',
}

type CostRow = Database['public']['Tables']['vehicle_costs']['Row']
type AcquisitionRow = Database['public']['Tables']['vehicle_acquisitions']['Row']

function toCost(row: CostRow): VehicleCost {
  return {
    id: row.id,
    dealershipId: row.dealership_id,
    vehicleId: row.vehicle_id,
    costType: row.cost_type as CostType,
    amount: Number(row.amount),
    description: row.description,
    supplier: row.supplier ?? undefined,
    incurredAt: row.incurred_at,
    createdAt: row.created_at,
  }
}

function toAcquisition(row: AcquisitionRow): VehicleAcquisition {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    acquisitionPrice: Number(row.acquisition_price),
    supplierName: row.supplier_name ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }
}

export async function listCostsByVehicle(vehicleId: string): Promise<VehicleCost[]> {
  const { data, error } = await supabase
    .from('vehicle_costs')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .order('incurred_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCost)
}

export async function listAllCosts(): Promise<VehicleCost[]> {
  const { data, error } = await supabase
    .from('vehicle_costs')
    .select('*')
    .order('incurred_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toCost)
}

export interface CreateCostInput {
  vehicleId: string
  costType: CostType
  amount: number
  description: string
  supplier?: string
  incurredAt: string
}

export async function createCost(input: CreateCostInput): Promise<VehicleCost> {
  const dealershipId = await getDealershipId()
  const { data, error } = await supabase
    .from('vehicle_costs')
    .insert({
      dealership_id: dealershipId,
      vehicle_id: input.vehicleId,
      cost_type: input.costType,
      amount: input.amount,
      description: input.description,
      supplier: input.supplier ?? null,
      incurred_at: input.incurredAt,
    })
    .select()
    .single()
  if (error) throw error
  const cost = toCost(data)
  void logActivity({
    action: 'create',
    entityType: 'cost',
    entityId: cost.id,
    vehicleId: cost.vehicleId,
    summary: `Lançou custo de ${COST_LABEL[cost.costType]} — ${formatBRLExact(cost.amount)}`,
  })
  return cost
}

export async function deleteCost(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('vehicle_costs')
    .delete()
    .eq('id', id)
    .select('cost_type, amount, vehicle_id')
    .single()
  if (error) throw error
  void logActivity({
    action: 'delete',
    entityType: 'cost',
    entityId: id,
    vehicleId: data?.vehicle_id ?? undefined,
    summary: `Removeu custo de ${COST_LABEL[data.cost_type as CostType]} — ${formatBRLExact(Number(data.amount))}`,
  })
}

export interface UpdateCostInput {
  costType?: CostType
  amount?: number
  description?: string
  supplier?: string | null
  incurredAt?: string
}

/** Edita um custo já lançado — sem excluir e recriar. */
export async function updateCost(id: string, patch: UpdateCostInput): Promise<VehicleCost> {
  const update: Database['public']['Tables']['vehicle_costs']['Update'] = {}
  if (patch.costType !== undefined) update.cost_type = patch.costType
  if (patch.amount !== undefined) update.amount = patch.amount
  if (patch.description !== undefined) update.description = patch.description
  if (patch.supplier !== undefined) update.supplier = patch.supplier
  if (patch.incurredAt !== undefined) update.incurred_at = patch.incurredAt
  const { data, error } = await supabase
    .from('vehicle_costs')
    .update(update)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  const cost = toCost(data)
  void logActivity({
    action: 'update',
    entityType: 'cost',
    entityId: cost.id,
    vehicleId: cost.vehicleId,
    summary: `Editou custo de ${COST_LABEL[cost.costType]} — ${formatBRLExact(cost.amount)}`,
  })
  return cost
}

export async function listAllAcquisitions(): Promise<VehicleAcquisition[]> {
  const { data, error } = await supabase.from('vehicle_acquisitions').select('*')
  if (error) throw error
  return (data ?? []).map(toAcquisition)
}

export async function getAcquisition(vehicleId: string): Promise<VehicleAcquisition | null> {
  const { data, error } = await supabase
    .from('vehicle_acquisitions')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .maybeSingle()
  if (error) throw error
  return data ? toAcquisition(data) : null
}

export interface UpsertAcquisitionInput {
  vehicleId: string
  acquisitionPrice: number
  supplierName?: string
  notes?: string
}

export async function upsertAcquisition(input: UpsertAcquisitionInput): Promise<VehicleAcquisition> {
  const { data, error } = await supabase
    .from('vehicle_acquisitions')
    .upsert(
      {
        vehicle_id: input.vehicleId,
        acquisition_price: input.acquisitionPrice,
        supplier_name: input.supplierName ?? null,
        notes: input.notes ?? null,
      },
      { onConflict: 'vehicle_id' },
    )
    .select()
    .single()
  if (error) throw error
  const acq = toAcquisition(data)
  void logActivity({
    action: 'update',
    entityType: 'acquisition',
    entityId: acq.id,
    vehicleId: acq.vehicleId,
    summary: `Definiu valor de aquisição em ${formatBRLExact(acq.acquisitionPrice)}`,
  })
  return acq
}

/**
 * Resumo financeiro do veículo.
 * `announcedPrice` (preço anunciado) permite calcular a margem projetada;
 * sem aquisição registrada a margem é null (não inventar números).
 */
export async function getVehicleFinancials(
  vehicleId: string,
  announcedPrice?: number,
): Promise<VehicleFinancials> {
  const [acquisition, costs] = await Promise.all([
    getAcquisition(vehicleId),
    listCostsByVehicle(vehicleId),
  ])
  const costsTotal = costs.reduce((sum, c) => sum + c.amount, 0)
  const acquisitionPrice = acquisition?.acquisitionPrice ?? null
  const totalInvested = (acquisitionPrice ?? 0) + costsTotal
  return {
    vehicleId,
    acquisitionPrice,
    costsTotal,
    costs,
    totalInvested,
    projectedMargin:
      acquisitionPrice !== null && announcedPrice !== undefined
        ? announcedPrice - totalInvested
        : null,
  }
}
