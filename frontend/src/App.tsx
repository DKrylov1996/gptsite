import { Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from './pages/HomePage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminLogin } from './pages/admin/AdminLogin'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App () {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="login" replace />} />
        <Route path="login" element={<AdminLogin />} />
        <Route
          path="dashboard"
          element={(
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
