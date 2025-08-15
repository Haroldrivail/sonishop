import axios from 'axios';

const api = axios.create({
  baseURL: 'http://public.test/api',
  withCredentials: true, // Nécessaire pour les cookies cross-domain
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Identifie les requêtes AJAX
  },
});

// Intercepteur pour CSRF
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour gérer les erreurs globales
api.interceptors.response.use(
  (response) => response,
  
);

// Gère l'expiration du token CSRF
const handleCsrfTokenExpiration = async (originalRequest) => {
  try {
    // 1. Demande un nouveau token CSRF
    await axios.get('http://public.test/sanctum/csrf-cookie', { 
      withCredentials: true 
    });
    
    // 2. Relance la requête originale
    return api(originalRequest);
  } catch (err) {
    return Promise.reject(err);
  }
};

// Helper pour les cookies (optimisé)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default api;