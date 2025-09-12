import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiClient } from '../api/client'
import { api } from '../api/client'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Configurer le token dans localStorage et headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
      setUser(null)
    }
  }, [token])

  // Vérifier l'utilisateur au chargement si token présent
  useEffect(() => {
    if (token) {
      checkUser()
    } else {
      setLoading(false)
    }
  }, [token])

  // Fonction simple pour récupérer l'utilisateur actuel
  const checkUser = async () => {
    try {
      const { data } = await apiClient.get('/auth/me')
      setUser(data.user)
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      // Token invalide, on nettoie
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  // Fonction simple pour sauvegarder la session après login réussi
  const setSession = (userData, userToken) => {
    setUser(userData)
    setToken(userToken)
  }

  // Rafraîchir explicitement l'utilisateur (ex: après upload avatar)
  const refreshUser = async () => {
    try {
      const { data } = await api.auth.me()
      if (data?.user) setUser(data.user)
      return { success: true, user: data?.user }
    } catch (e) {
      return { success: false, error: e }
    }
  }

  // Fonction simple pour nettoyer la session
  const clearSession = () => {
    setUser(null)
    setToken(null)
  }

  // Déconnexion (API + nettoyage local)
  const logout = async () => {
    try {
      if (token) {
        try { await api.auth.logout() } catch (e) { /* ignorer erreurs serveur */ }
      }
    } finally {
      clearSession()
    }
  }

  // Fonction pour authentifier avec un token
  const login = async (authToken) => {
    try {
      setToken(authToken)
      // Récupérer les informations utilisateur avec le token
      await checkUser()
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error)
      clearSession()
    }
  }

  // Mettre à jour le profil utilisateur via l'API
  const updateProfile = async (profileData) => {
    try {
      await api.profile.update(profileData)
      // Recharger l'utilisateur à jour
      const { data } = await api.profile.get()
      if (data) {
        // Certains endpoints renvoient { user: {...} }, d'autres directement les champs
        setUser(data.user || { ...user, ...profileData })
      } else {
        setUser(prev => ({ ...prev, ...profileData }))
      }
      return { success: true }
    } catch (err) {
      const formatted = err?.response?.data?.formattedErrors
      return { success: false, errors: formatted || null, raw: err }
    }
  }

  // Mettre à jour le mot de passe utilisateur
  const updatePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
    try {
      await api.profile.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword
      })
      return { success: true }
    } catch (err) {
      const formatted = err?.response?.data?.formattedErrors
      return { success: false, errors: formatted || null, raw: err }
    }
  }

  const value = {
    // État
    user,
    loading,
    token,
    
    // Actions simples
    setSession,
    clearSession,
    login,
  refreshUser,
  updateProfile,
  updatePassword,
  logout,
    
    // Computed
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
