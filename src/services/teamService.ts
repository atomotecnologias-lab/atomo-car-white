import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import type { TeamMember, TeamRole } from '@/types/team'
import { getDealershipId } from './dealershipService'

type MemberRow = Database['public']['Tables']['team_members']['Row']

function toMember(row: MemberRow): TeamMember {
  return {
    id: row.id,
    dealershipId: row.dealership_id,
    userId: row.user_id ?? undefined,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role as TeamRole,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export async function listTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('created_at')
  if (error) throw error
  return (data ?? []).map(toMember)
}

export async function listActiveSellers(): Promise<TeamMember[]> {
  const members = await listTeamMembers()
  return members.filter((m) => m.role === 'seller' && m.isActive)
}

/** Membro vinculado ao usuário logado — define o papel na UI. */
export async function getCurrentMember(): Promise<TeamMember | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data ? toMember(data) : null
}

export interface CreateMemberInput {
  name: string
  email?: string
  phone?: string
  role: TeamRole
}

export async function createTeamMember(input: CreateMemberInput): Promise<TeamMember> {
  const dealershipId = await getDealershipId()
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      dealership_id: dealershipId,
      user_id: null,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      role: input.role,
      is_active: true,
    })
    .select()
    .single()
  if (error) throw error
  return toMember(data)
}

export interface UpdateMemberInput {
  name?: string
  email?: string
  phone?: string
  role?: TeamRole
  isActive?: boolean
}

export async function updateTeamMember(id: string, input: UpdateMemberInput): Promise<void> {
  const patch: Record<string, unknown> = {}
  if (input.name !== undefined) patch.name = input.name
  if (input.email !== undefined) patch.email = input.email || null
  if (input.phone !== undefined) patch.phone = input.phone || null
  if (input.role !== undefined) patch.role = input.role
  if (input.isActive !== undefined) patch.is_active = input.isActive
  const { error } = await supabase.from('team_members').update(patch).eq('id', id)
  if (error) throw error
}
