import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// ProtectedRoute: protège les routes nécessitant authentification et éventuellement email vérifié
export default function ProtectedRoute({ requireVerified = true }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement de la session...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireVerified && !user.email_verified_at) {
    return <Navigate to="/verify-email" replace state={{ email: user.email }} />
  }

  return <Outlet />
}
