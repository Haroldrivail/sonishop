import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const UnverifiedOnlyRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()

  // Attendre que le contexte soit chargé
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-soni-navy mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si l'utilisateur n'est pas connecté, autoriser l'accès à la page de vérification
  if (!isAuthenticated) {
    return children
  }

  // Si l'utilisateur est connecté et vérifié, rediriger selon son rôle
  if (user?.email_verified_at) {
    if (user.role === 'admin') {
      return <Navigate to="/dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  // Si l'utilisateur est connecté mais pas vérifié, autoriser l'accès
  return children
}

export default UnverifiedOnlyRoute
