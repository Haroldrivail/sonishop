import { useAuth } from '../context/AuthContext'
import { apiClient } from '../api/client'
import { useNavigate } from 'react-router-dom'

// Hook simplifié pour les actions d'authentification courantes
export const useAuthActions = () => {
  const { user, token, setSession, clearSession } = useAuth()
  const navigate = useNavigate()

  // Déconnexion simple
  const logout = async () => {
    try {
      if (token) {
  await apiClient.post('/auth/logout')
      }
    } catch (error) {
      // On ignore les erreurs de logout côté serveur
      console.warn('Logout error:', error)
    } finally {
      clearSession()
      navigate('/login')
    }
  }

  // Connexion simple
  const login = async (credentials, redirectTo = '/') => {
    try {
  const { data } = await apiClient.post('/auth/login', credentials)
      setSession(data.user, data.token)
      navigate(redirectTo)
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Inscription simple
  const register = async (userData) => {
    try {
  const { data } = await apiClient.post('/auth/register', userData)
      // Ne pas connecter automatiquement - attendre la vérification email
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Renvoyer email de vérification
  const resendVerificationEmail = async (email) => {
    try {
      if (user && token) {
  await apiClient.post('/auth/email/resend-authenticated')
      } else {
  await apiClient.post('/auth/email/resend', { email })
      }
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    // État
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    
    // Actions
    login,
    register,
    logout,
    resendVerificationEmail
  }
}
