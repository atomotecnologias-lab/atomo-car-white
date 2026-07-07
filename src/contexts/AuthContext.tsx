import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { TeamMember, TeamRole } from '@/types/team'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  /** Cadastro em team_members vinculado ao usuário (null = sem cadastro). */
  member: TeamMember | null
  /**
   * Papel efetivo. Usuário autenticado SEM cadastro em team_members é
   * tratado como owner — mesmo fallback das políticas RLS (evita lockout).
   */
  role: TeamRole
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<TeamMember | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carrega o cadastro/papel quando a sessão muda
  useEffect(() => {
    let cancelled = false
    const userId = session?.user?.id
    if (!userId) {
      setMember(null)
      return
    }
    supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setMember(
          data
            ? {
                id: data.id,
                dealershipId: data.dealership_id,
                userId: data.user_id ?? undefined,
                name: data.name,
                email: data.email ?? undefined,
                phone: data.phone ?? undefined,
                role: data.role as TeamRole,
                isActive: data.is_active,
                createdAt: data.created_at,
              }
            : null,
        )
      })
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  async function signOut() {
    await supabase.auth.signOut()
  }

  const role: TeamRole = member?.role ?? 'owner'

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, member, role, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
