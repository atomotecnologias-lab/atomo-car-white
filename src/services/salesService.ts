import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type {
  CommissionBase,
  CommissionType,
  PaymentMethod,
  RegisterSaleInput,
  Sale,
  SellerSale,
} from '@/types/sale'
import type { VehicleStatus } from '@/types/vehicle'
import { computeSaleProfit } from '@/lib/commission'
import { getDealershipId } from './dealershipService'
import { getCommissionConfig } from './settingsService'
import { getAcquisition, listCostsByVehicle } from './costsService'
import { updateVehicleStatus } from './vehiclesService'

type SaleRow = Database['public']['Tables']['sales']['Row']
type SellerSaleRow = Database['public']['Views']['seller_sales']['Row']

/** Erro específico: venda exige aquisição registrada (UI mostra CTA). */
export class MissingAcquisitionError extends Error {
  constructor(public vehicleId: string) {
    super('Registre o valor de aquisição do veículo antes de vender.')
    this.name = 'MissingAcquisitionError'
  }
}

function toSale(row: SaleRow): Sale {
  return {
    id: row.id,
    dealershipId: row.dealership_id,
    vehicleId: row.vehicle_id,
    sellerId: row.seller_id ?? undefined,
    leadId: row.lead_id ?? undefined,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone ?? undefined,
    salePrice: Number(row.sale_price),
    soldAt: row.sold_at,
    paymentMethod: row.payment_method as PaymentMethod,
    acquisitionPriceSnapshot: Number(row.acquisition_price_snapshot),
    costsTotalSnapshot: Number(row.costs_total_snapshot),
    commissionTypeSnapshot: row.commission_type_snapshot as CommissionType,
    commissionBaseSnapshot: row.commission_base_snapshot as CommissionBase,
    commissionValueSnapshot: Number(row.commission_value_snapshot),
    commissionAmount: Number(row.commission_amount),
    grossProfit: Number(row.gross_profit),
    netProfit: Number(row.net_profit),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  }
}

export async function listSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('sold_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(toSale)
}

export async function getSaleByVehicleId(vehicleId: string): Promise<Sale | null> {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .maybeSingle()
  if (error) throw error
  return data ? toSale(data) : null
}

/** Vendas do vendedor logado — via view segura (sem custo/lucro). */
export async function listMySales(): Promise<SellerSale[]> {
  const { data, error } = await supabase
    .from('seller_sales' as never)
    .select('*')
    .order('sold_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as SellerSaleRow[]).map((row) => ({
    id: row.id,
    vehicleId: row.vehicle_id,
    sellerId: row.seller_id,
    buyerName: row.buyer_name,
    salePrice: Number(row.sale_price),
    soldAt: row.sold_at,
    paymentMethod: row.payment_method as PaymentMethod,
    commissionAmount: Number(row.commission_amount),
  }))
}

/** Prévia da venda (lucro + comissão) sem persistir — usada no wizard. */
export async function previewSale(vehicleId: string, salePrice: number, hasSeller: boolean) {
  const [acquisition, costs, config] = await Promise.all([
    getAcquisition(vehicleId),
    listCostsByVehicle(vehicleId),
    getCommissionConfig(),
  ])
  if (!acquisition) throw new MissingAcquisitionError(vehicleId)
  const costsTotal = costs.reduce((sum, c) => sum + c.amount, 0)
  return {
    ...computeSaleProfit({
      salePrice,
      acquisitionPrice: acquisition.acquisitionPrice,
      costsTotal,
      config,
      hasSeller,
    }),
    config,
  }
}

function lastDayOfMonth(isoDate: string): string {
  const [y, m] = isoDate.slice(0, 10).split('-').map(Number)
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Cadeia da venda (ordem defensiva — sales primeiro; falha adiante
 * desfaz via undoSale, que cascateia os lançamentos):
 * 1. valida aquisição + calcula snapshots
 * 2. INSERT sales
 * 3. veículo → sold (despublica do site)
 * 4. receivable da venda (à vista/pix = pago; financiamento = +30d aberto)
 * 5. payable de comissão (se houver)
 * 6. payable de repasse ao consignante (se consignação)
 * 7. lead vinculado → sold
 */
export async function registerSale(input: RegisterSaleInput): Promise<Sale> {
  const dealershipId = await getDealershipId()

  const { data: vehicleRow, error: vehicleError } = await supabase
    .from('vehicles')
    .select('id, brand, model, status, acquisition_source')
    .eq('id', input.vehicleId)
    .single()
  if (vehicleError) throw vehicleError
  if (vehicleRow.status === 'sold') throw new Error('Este veículo já foi vendido.')

  const acquisition = await getAcquisition(input.vehicleId)
  if (!acquisition) throw new MissingAcquisitionError(input.vehicleId)

  const [costs, config] = await Promise.all([
    listCostsByVehicle(input.vehicleId),
    getCommissionConfig(),
  ])
  const costsTotal = costs.reduce((sum, c) => sum + c.amount, 0)
  const breakdown = computeSaleProfit({
    salePrice: input.salePrice,
    acquisitionPrice: acquisition.acquisitionPrice,
    costsTotal,
    config,
    hasSeller: Boolean(input.sellerId),
  })

  const { data: { user } } = await supabase.auth.getUser()
  const previousStatus = vehicleRow.status as VehicleStatus
  const vehicleLabel = `${vehicleRow.brand} ${vehicleRow.model}`

  const { data: saleRow, error: saleError } = await supabase
    .from('sales')
    .insert({
      dealership_id: dealershipId,
      vehicle_id: input.vehicleId,
      seller_id: input.sellerId ?? null,
      lead_id: input.leadId ?? null,
      buyer_name: input.buyerName,
      buyer_phone: input.buyerPhone ?? null,
      sale_price: input.salePrice,
      sold_at: input.soldAt,
      payment_method: input.paymentMethod,
      acquisition_price_snapshot: acquisition.acquisitionPrice,
      costs_total_snapshot: costsTotal,
      commission_type_snapshot: config.type,
      commission_base_snapshot: config.base,
      commission_value_snapshot: config.value,
      commission_amount: breakdown.commissionAmount,
      notes: input.notes ?? null,
      created_by: user?.id ?? null,
    } as never)
    .select()
    .single()
  if (saleError) throw saleError
  const sale = toSale(saleRow)

  try {
    await updateVehicleStatus(input.vehicleId, 'sold')

    const instantPayment = input.paymentMethod === 'cash' || input.paymentMethod === 'pix'
    const entries: Database['public']['Tables']['financial_entries']['Insert'][] = [
      {
        dealership_id: dealershipId,
        kind: 'receivable',
        category: 'vehicle_sale',
        description: `Venda ${vehicleLabel} — ${input.buyerName}`,
        amount: input.salePrice,
        due_date: instantPayment ? input.soldAt : addDays(input.soldAt, 30),
        paid_at: instantPayment ? input.soldAt : null,
        vehicle_id: input.vehicleId,
        sale_id: sale.id,
        team_member_id: null,
      },
    ]

    if (breakdown.commissionAmount > 0 && input.sellerId) {
      entries.push({
        dealership_id: dealershipId,
        kind: 'payable',
        category: 'commission',
        description: `Comissão — venda ${vehicleLabel}`,
        amount: breakdown.commissionAmount,
        due_date: lastDayOfMonth(input.soldAt),
        paid_at: null,
        vehicle_id: input.vehicleId,
        sale_id: sale.id,
        team_member_id: input.sellerId,
      })
    }

    if (vehicleRow.acquisition_source === 'consignment') {
      entries.push({
        dealership_id: dealershipId,
        kind: 'payable',
        category: 'consignment_payout',
        description: `Repasse consignação — ${vehicleLabel}`,
        amount: acquisition.acquisitionPrice,
        due_date: addDays(input.soldAt, 7),
        paid_at: null,
        vehicle_id: input.vehicleId,
        sale_id: sale.id,
        team_member_id: null,
      })
    }

    const { error: entriesError } = await supabase.from('financial_entries').insert(entries)
    if (entriesError) throw entriesError

    if (input.leadId) {
      await supabase.from('leads').update({ status: 'sold' }).eq('id', input.leadId)
    }

    return sale
  } catch (chainError) {
    // Rollback best-effort: apagar a venda cascateia os lançamentos
    await supabase.from('sales').delete().eq('id', sale.id)
    await updateVehicleStatus(input.vehicleId, previousStatus)
    throw chainError
  }
}

/** Desfaz a venda: DELETE cascateia lançamentos; veículo volta a ativo. */
export async function undoSale(saleId: string): Promise<void> {
  const { data: saleRow, error: fetchError } = await supabase
    .from('sales')
    .select('vehicle_id')
    .eq('id', saleId)
    .single()
  if (fetchError) throw fetchError

  const { error } = await supabase.from('sales').delete().eq('id', saleId)
  if (error) throw error

  await updateVehicleStatus(saleRow.vehicle_id, 'active')
}
