import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { ActivityEntry, AuditAction, AuditEntity } from '@/types/audit'
import { getDealershipId } from './dealershipService'

type AuditRow = Database['public']['Tables']['audit_log']['Row']

// ------------------------------------------------------------
// Ator atual — setado pelo AuthContext (services não têm React context).
// ------------------------------------------------------------
let currentActor: { userId?: string; name: string } = { name: 'Sistema' }

export function setCurrentActor(actor: { userId?: string; name: string }): void {
  currentActor = { userId: actor.userId, name: actor.name || 'Sistema' }
}

export interface LogActivityInput {
  action: AuditAction
  entityType: AuditEntity
  entityId?: string
  vehicleId?: string
  summary: string
}

/**
 * Registra uma ação de auditoria. Fire-and-forget: NUNCA propaga erro —
 * auditoria não pode quebrar o fluxo principal (venda, lançamento etc.).
 */
export async function logActivity(input: LogActivityInput): Promise<void> {
  try {
    const dealershipId = await getDealershipId()
    const row: Database['public']['Tables']['audit_log']['Insert'] = {
      dealership_id: dealershipId,
      actor_user_id: currentActor.userId ?? null,
      actor_name: currentActor.name,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      vehicle_id: input.vehicleId ?? null,
      summary: input.summary,
    }
    const { error } = await supabase.from('audit_log').insert(row)
    if (error) console.warn('[audit] falha ao registrar atividade:', error.message)
  } catch (err) {
    console.warn('[audit] falha ao registrar atividade:', err)
  }
}

function toActivity(row: AuditRow): ActivityEntry {
  return {
    id: row.id,
    actorName: row.actor_name,
    action: row.action as AuditAction,
    entityType: row.entity_type as AuditEntity,
    entityId: row.entity_id ?? undefined,
    vehicleId: row.vehicle_id ?? undefined,
    summary: row.summary,
    createdAt: row.created_at,
  }
}

export interface ListActivityFilter {
  vehicleId?: string
  limit?: number
}

/** Lista as atividades mais recentes (só o dono lê — RLS). */
export async function listActivity(filter: ListActivityFilter = {}): Promise<ActivityEntry[]> {
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filter.limit ?? 50)
  if (filter.vehicleId) query = query.eq('vehicle_id', filter.vehicleId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(toActivity)
}
