import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import atomoCarLogo from '@/assets/atomo-car-logo.svg.asset.json'

export const Route = createFileRoute('/login')({
  head: () => ({
    meta: [{ title: 'Login — Atomo Car Cockpit' }, { name: 'robots', content: 'noindex' }],
  }),
  component: LoginPage,
})

function LoginPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  useEffect(() => {
    if (!loading && session) {
      navigate({ to: '/admin' })
    }
  }, [session, loading, navigate])

  async function handleForgotPassword() {
    if (!email) {
      setError('Informe seu e-mail acima para redefinir a senha.')
      return
    }
    await supabase.auth.resetPasswordForEmail(email)
    setResetSent(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('E-mail ou senha incorretos.')
      setSubmitting(false)
    } else {
      navigate({ to: '/admin' })
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-carbon px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-premium ring-1 ring-white/10">
            <img src={atomoCarLogo.url} alt="Atomo Car" className="h-12 w-12 object-contain" />
          </span>
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold text-clean">Atomo Car Cockpit</h1>
            <p className="mt-1 text-sm text-titanium">Acesse o painel de operações</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-widest text-titanium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-premium px-4 py-3 text-sm text-clean placeholder:text-titanium/50 focus:border-performance/50 focus:outline-none focus:ring-1 focus:ring-performance/30"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-widest text-titanium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-premium px-4 py-3 text-sm text-clean placeholder:text-titanium/50 focus:border-performance/50 focus:outline-none focus:ring-1 focus:ring-performance/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-performance py-3 text-sm font-semibold text-carbon transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="text-center">
            {resetSent ? (
              <p className="text-xs text-performance">
                E-mail de redefinição enviado. Verifique sua caixa de entrada.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-titanium hover:text-clean"
              >
                Esqueci minha senha
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
