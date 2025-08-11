import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Types d'actions pour le reducer
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// État initial
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: false
}

// Reducer pour gérer l'état d'authentification
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false
      }
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Création du contexte
const AuthContext = createContext()

// Provider du contexte d'authentification
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user)
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: parsedUser
        })
      } catch (error) {
        // Si erreur de parsing, déconnecter l'utilisateur
        logout()
      }
    }
  }, [])

  // Fonction de connexion
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    
    try {
      // TODO: Remplacer par l'appel API réel vers Laravel
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      })
      
      if (!response.ok) {
        throw new Error('Identifiants incorrects')
      }
      
      const data = await response.json()
      
      // Stocker dans localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: data
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message
      })
      return { success: false, error: error.message }
    }
  }

  // Fonction d'inscription
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })
    
    try {
      // TODO: Remplacer par l'appel API réel vers Laravel
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'inscription')
      }
      
      const data = await response.json()
      
      // Stocker dans localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: data
      })
      
      return { success: true }
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.message
      })
      return { success: false, error: error.message }
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Fonction pour effacer les erreurs
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  // Valeurs du contexte
  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}
