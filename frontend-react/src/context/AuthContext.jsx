// context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../api/axios'; // axios configuré avec withCredentials + XSRF-TOKEN

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true, loading: false, error: null };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔄 Vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    api.get('/user')
      .then(({ data }) => {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: data });
      })
      .catch(() => {
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      });
  }, []);

  // Login avec CSRF
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      await api.get('/sanctum/csrf-cookie'); // // Cela devient http://public.test/api/sanctum/csrf-cookie grâce au prefix
      const response = await api.post('/login', credentials);
      const { user } = response.data;

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: user });
      return { success: true, user };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.response?.data?.message || 'Erreur inconnue',
      });
      return { success: false, error: error.response?.data?.message || 'Erreur inconnue' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      await api.get('/sanctum/csrf-cookie'); // 🔐 Obligatoire avant register
      const response = await api.post('/register', userData);
      const { user } = response.data;

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: user });
      return { success: true };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: error.response?.data?.message || error.message,
      });
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
      // ignore erreur logout
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}
