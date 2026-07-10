import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type {
  CreateEntryInput,
  CreateSeriesInput,
  EntryCategory,
  EntryKind,
  EntryStatus,
  FinancialEntry,
  SeriesFrequency,
  SeriesType,
} from '@/types/finance'
import { roundCents } from '@/lib/commission'
import { addInterval } from '@/lib/dates'
import { formatBRLExact } from '@/lib/format'
import { getDealershipId } from './dealershipService'
import { logActivity } from './auditService'

/** Limite defensivo de ocorrências por série (evita explosão de linhas). */
export const MAX_SERIES = 60

type EntryRow = Database['public']['Tables']['financial_entries']['Row']

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function deriveStatus(entry: { paidAt?: string; dueDate: string }, today = todayISO()): EntryStatus {
  if (entry.paidAt) return 'paid'
  return entry.dueDate < today ? 'overdue' : 'open'
}

function toEntry(row: EntryRow): FinancialEntry {
  const base = {
    id: row.id,
    dealershipId: row.dealership_id,
    kind: row.kind as EntryKind,
    category: row.category as EntryCategory,
    description: row.description,
    amount: Number(row.amount),
    dueDate: row.due_date,
    paidAt: row.paid_at ?? undefined,
    vehicleId: row.vehicle_id ?? undefined,
    saleId: row.sale_id ?? undefined,
    teamMemberId: row.team_member_id ?? undefined,
    createdAt: row.created_at,
    groupId: row.group_id ?? undefined,
    seriesType: (row.series_type as SeriesType | null) ?? undefined,
    seriesIndex: row.series_index ?? undefined,
    seriesTotal: row.series_total ?? undefined,
    seriesFrequency: (row.series_frequency as SeriesFrequency | null) ?? undefined,
  }
  return { ...base, status: deriveStatus(base) }
}

export interface ListEntriesFilter {
  kind?: EntryKind
  category?: EntryCategory
  /** Somente em aberto (inclui vencidas). */
  openOnly?: boolean
}

export async function listEntries(filter: ListEntriesFilter = {}): Promise<FinancialEntry[]> {
  let query = supabase.from('financial_entries').select('*').order('due_date', { ascending: true })
  if (filter.kind) query = query.eq('kind', filter.kind)
  if (filter.category) query = query.eq('category', filter.category)
  if (filter.openOnly) query = query.is('paid_at', null)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(toEntry)
}

export async function createEntry(input: CreateEntryInput): Promise<FinancialEntry> {
  const dealershipId = await getDealershipId()
  const { data, error } = await supabase
    .from('financial_entries')
    .insert({
      dealership_id: dealershipId,
      kind: input.kind,
      category: input.category,
      description: input.description,
      amount: input.amount,
      due_date: input.dueDate,
      paid_at: input.paidAt ?? null,
      vehicle_id: input.vehicleId ?? null,
      sale_id: null,
      team_member_id: input.teamMemberId ?? null,
    })
    .select()
    .single()
  if (error) throw error
  const entry = toEntry(data)
  void logActivity({
    action: 'create',
    entityType: 'entry',
    entityId: entry.id,
    vehicleId: entry.vehicleId,
    summary: `Lançou ${entry.kind === 'payable' ? 'conta a pagar' : 'conta a receber'} “${entry.description}” de ${formatBRLExact(entry.amount)}`,
  })
  return entry
}

/**
 * Divide um total em `n` parcelas de centavos exatos.
 * O resto de arredondamento vai na ÚLTIMA parcela (soma == total).
 */
export function splitTotal(total: number, n: number): number[] {
  const base = roundCents(total / n)
  const parts = Array<number>(n).fill(base)
  const diff = roundCents(total - base * n)
  parts[n - 1] = roundCents(parts[n - 1] + diff)
  return parts
}

/**
 * Cria uma série de lançamentos materializados (uma linha por ocorrência),
 * compartilhando o mesmo group_id. Um único insert em lote.
 * - installment: divide `totalAmount` em `count` parcelas.
 * - recurring: repete `amountPerEntry` fixo `count` vezes.
 */
export async function createEntrySeries(input: CreateSeriesInput): Promise<FinancialEntry[]> {
  const dealershipId = await getDealershipId()
  const count = Math.max(2, Math.min(MAX_SERIES, Math.floor(input.count)))
  const groupId = crypto.randomUUID()

  const amounts =
    input.seriesType === 'installment'
      ? splitTotal(input.totalAmount ?? 0, count)
      : Array<number>(count).fill(roundCents(input.amountPerEntry ?? 0))

  const rows: Database['public']['Tables']['financial_entries']['Insert'][] = Array.from(
    { length: count },
    (_, i) => ({
      dealership_id: dealershipId,
      kind: input.kind,
      category: input.category,
      description: input.description,
      amount: amounts[i],
      due_date: addInterval(input.firstDueDate, input.frequency, i),
      paid_at: null,
      vehicle_id: input.vehicleId ?? null,
      sale_id: null,
      team_member_id: input.teamMemberId ?? null,
      group_id: groupId,
      series_type: input.seriesType,
      series_index: i + 1,
      series_total: count,
      series_frequency: input.frequency,
    }),
  )

  const { data, error } = await supabase.from('financial_entries').insert(rows).select()
  if (error) throw error
  const entries = (data ?? []).map(toEntry)
  if (entries[0]) {
    void logActivity({
      action: 'create',
      entityType: 'entry',
      vehicleId: entries[0].vehicleId,
      summary: `Criou série de ${count}x “${input.description}” (${input.kind === 'payable' ? 'a pagar' : 'a receber'})`,
    })
  }
  return entries
}

/**
 * Exclui uma série inteira. Por padrão só remove as em aberto
 * (preserva o histórico das já pagas/recebidas).
 */
export async function deleteSeries(
  groupId: string,
  opts: { openOnly?: boolean } = { openOnly: true },
): Promise<void> {
  const { data: sample } = await supabase
    .from('financial_entries')
    .select('description, vehicle_id')
    .eq('group_id', groupId)
    .limit(1)
    .maybeSingle()
  let query = supabase.from('financial_entries').delete().eq('group_id', groupId)
  if (opts.openOnly) query = query.is('paid_at', null)
  const { error } = await query
  if (error) throw error
  if (sample) {
    void logActivity({
      action: 'delete',
      entityType: 'entry',
      vehicleId: sample.vehicle_id ?? undefined,
      summary: `Excluiu lançamentos em aberto da série “${sample.description}”`,
    })
  }
}

export async function markEntryPaid(id: string, paidAt = todayISO()): Promise<void> {
  const { data, error } = await supabase
    .from('financial_entries')
    .update({ paid_at: paidAt })
    .eq('id', id)
    .select('kind, description, amount, vehicle_id')
    .single()
  if (error) throw error
  void logActivity({
    action: 'pay',
    entityType: 'entry',
    entityId: id,
    vehicleId: data.vehicle_id ?? undefined,
    summary: `${data.kind === 'payable' ? 'Pagou' : 'Recebeu'} “${data.description}” (${formatBRLExact(Number(data.amount))})`,
  })
}

export async function markEntryUnpaid(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('financial_entries')
    .update({ paid_at: null })
    .eq('id', id)
    .select('kind, description, vehicle_id')
    .single()
  if (error) throw error
  void logActivity({
    action: 'unpay',
    entityType: 'entry',
    entityId: id,
    vehicleId: data.vehicle_id ?? undefined,
    summary: `Reabriu “${data.description}”`,
  })
}

export async function deleteEntry(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('financial_entries')
    .delete()
    .eq('id', id)
    .select('description, amount, vehicle_id')
    .single()
  if (error) throw error
  void logActivity({
    action: 'delete',
    entityType: 'entry',
    entityId: id,
    vehicleId: data?.vehicle_id ?? undefined,
    summary: `Excluiu o lançamento “${data.description}” (${formatBRLExact(Number(data.amount))})`,
  })
}

export interface UpdateEntryInput {
  description?: string
  category?: EntryCategory
  amount?: number
  dueDate?: string
}

/** Edita um lançamento existente (descrição/categoria/valor/vencimento). */
export async function updateEntry(id: string, patch: UpdateEntryInput): Promise<void> {
  const update: Database['public']['Tables']['financial_entries']['Update'] = {}
  if (patch.description !== undefined) update.description = patch.description
  if (patch.category !== undefined) update.category = patch.category
  if (patch.amount !== undefined) update.amount = patch.amount
  if (patch.dueDate !== undefined) update.due_date = patch.dueDate
  const { error } = await supabase.from('financial_entries').update(update).eq('id', id)
  if (error) throw error
  void logActivity({
    action: 'update',
    entityType: 'entry',
    entityId: id,
    summary: `Editou o lançamento${patch.description ? ` “${patch.description}”` : ''}${patch.amount !== undefined ? ` — ${formatBRLExact(patch.amount)}` : ''}`,
  })
}

// ------------------------------------------------------------
// Agregações para dashboard e visão geral do financeiro
// ------------------------------------------------------------

export interface OpenTotals {
  payableOverdue: number
  payableToday: number
  payableNext7Days: number
  payableOpenTotal: number
  receivableOpenTotal: number
  receivableOverdue: number
}

export async function getOpenTotals(): Promise<OpenTotals> {
  const entries = await listEntries({ openOnly: true })
  const today = todayISO()
  const in7 = (() => {
    const d = new Date(`${today}T00:00:00`)
    d.setDate(d.getDate() + 7)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })()

  const totals: OpenTotals = {
    payableOverdue: 0,
    payableToday: 0,
    payableNext7Days: 0,
    payableOpenTotal: 0,
    receivableOpenTotal: 0,
    receivableOverdue: 0,
  }
  for (const e of entries) {
    if (e.kind === 'payable') {
      totals.payableOpenTotal += e.amount
      if (e.dueDate < today) totals.payableOverdue += e.amount
      else if (e.dueDate === today) totals.payableToday += e.amount
      else if (e.dueDate <= in7) totals.payableNext7Days += e.amount
    } else {
      totals.receivableOpenTotal += e.amount
      if (e.dueDate < today) totals.receivableOverdue += e.amount
    }
  }
  return totals
}

export interface MonthlyCashflow {
  /** "2026-02" */
  month: string
  inflow: number
  outflow: number
  net: number
}

/** Fluxo de caixa realizado (lançamentos pagos) dos últimos N meses. */
export async function getMonthlyCashflow(months = 6): Promise<MonthlyCashflow[]> {
  const { data, error } = await supabase
    .from('financial_entries')
    .select('kind, amount, paid_at')
    .not('paid_at', 'is', null)
  if (error) throw error

  const now = new Date()
  const keys: string[] = []
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  const map = new Map<string, MonthlyCashflow>(
    keys.map((k) => [k, { month: k, inflow: 0, outflow: 0, net: 0 }]),
  )

  for (const row of data ?? []) {
    const month = (row.paid_at as string).slice(0, 7)
    const bucket = map.get(month)
    if (!bucket) continue
    const amount = Number(row.amount)
    if (row.kind === 'receivable') bucket.inflow += amount
    else bucket.outflow += amount
  }
  for (const bucket of map.values()) bucket.net = bucket.inflow - bucket.outflow
  return keys.map((k) => map.get(k)!)
}
