import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'top10.albums.token'

interface AuthContextValue {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider ({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem(TOKEN_KEY)
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }
    }
  }, [token])

  const value = useMemo(() => ({
    token,
    isAuthenticated: Boolean(token),
    setToken: setTokenState,
    logout: () => setTokenState(null)
  }), [token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }
  return ctx
}
