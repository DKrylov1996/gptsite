import { useMutation } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FormEvent, useState } from 'react'
import { Lock, LogIn } from 'lucide-react'

import { login } from '../../api/admin'
import { useAuth } from '../../hooks/useAuth'

export function AdminLogin () {
  const navigate = useNavigate()
  const location = useLocation()
  const { setToken } = useAuth()
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token)
      const redirectTo = (location.state as any)?.from?.pathname ?? '/admin/dashboard'
      navigate(redirectTo, { replace: true })
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || 'Unable to sign in')
    }
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '')
    const password = String(formData.get('password') ?? '')
    setError('')
    mutation.mutate({ email, password })
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-highlight/20 p-3 text-highlight">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="font-display text-2xl font-semibold">Admin Access</h1>
          <p className="text-sm text-white/50">Sign in to curate annual Top 10 selections.</p>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              className="rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              className="rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-highlight disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" /> {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
