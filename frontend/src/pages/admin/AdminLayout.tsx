import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Disc3 } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'

export function AdminLayout () {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-night via-night to-black text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/30 px-8 py-6 backdrop-blur">
        <div className="flex items-center gap-3">
          <Disc3 className="h-7 w-7 text-highlight" />
          <div>
            <p className="font-display text-xl font-semibold">Top 10 Admin</p>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Curate the annual experience</p>
          </div>
        </div>
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70 transition hover:border-highlight hover:text-highlight"
          >
            Sign out
          </button>
        ) : null}
      </header>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-10">
        <AnimateSection key={location.pathname}>
          <Outlet />
        </AnimateSection>
      </main>
    </div>
  )
}

function AnimateSection ({ children }: { children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {children}
    </motion.section>
  )
}
