import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
// En haut du fichier
import axios from 'axios';  // Import principal
import api from '../axios'; // Import de votre instance configurée

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
  token: localStorage.getItem('auth_token') || null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('auth_token') // Connecté par défaut pour les tests
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
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const response = await api.get('/user');
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: response.data
      });
    } catch (error) {
      console.error("Failed to load user:", error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);


  // Fonction de connexion
 const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // 1. Obtenir le cookie CSRF
      await axios.get('http://public.test/api/sanctum/csrf-cookie', {
        withCredentials: true,
      });

      // 2. Effectuer la connexion
      const response = await axios.post('http://public.test/api/login', credentials,{
        withCredentials: true, // Inclut automatiquement XSRF-TOKEN
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          // 'X-XSRF-TOKEN' est automatiquement ajouté par Axios si withCredentials=true
        },
      });

      // 3. Stocker les données
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Échec de connexion";
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };


  // Fonction d'inscription
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      // 1. Obtenir le cookie CSRF
      await axios.get('http://public.test/api/sanctum/csrf-cookie', {
        withCredentials: true
      });

      // 2. Envoyer les données avec tous les champs requis
      const response = await axios.post('http://public.test/api/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        phone: userData.phone,
        address: userData.address, // Optionnel
        role: 'client' // Valeur par défaut
      }, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      // 3. Stocker les données et gérer la réponse
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: {
          user: response.data.user,
          token: response.data.token
        }
      });
      
      return { success: true };
    } catch (error) {
      // Gestion améliorée des erreurs
      let errorMessage = "Erreur lors de l'inscription";
      
      if (error.response) {
        if (error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).flat().join(', ');
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Fonction de déconnexion
   const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

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
};
