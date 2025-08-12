import React, { createContext, useReducer, useContext, useEffect } from 'react';

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE'
};

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem('token')
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, loading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, token: null, isAuthenticated: false };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Effet de synchronisation au chargement de l'app
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: JSON.parse(user) });
      } catch {
        logout();
      }
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const res = await fetch('http://public.test/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data });
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userInfo) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const res = await fetch('http://public.test/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInfo)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Erreur lors de l\'inscription');
      }

      const data = await res.json();
      // On stocke token et user comme pour login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: data });
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  return (
    <AuthContext.Provider value={{ ...state, login, logout, clearError, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}
