import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

interface Props {
  children: React.ReactElement
}

export function ProtectedRoute ({ children }: Props) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
