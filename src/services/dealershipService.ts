import { supabase } from '@/lib/supabase'

let cachedId: string | null = null

/** Id da loja atual (operação single-store; cacheado por sessão). */
export async function getDealershipId(): Promise<string> {
  if (cachedId) return cachedId
  const { data, error } = await supabase.from('dealerships').select('id').single()
  if (error) throw error
  cachedId = data.id
  return cachedId
}
