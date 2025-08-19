import axios from 'axios';

const api = axios.create({
  baseURL: 'http://public.test/api',
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Intercepteur pour gérer la récupération du token CSRF avant les requêtes POST/PUT/DELETE
api.interceptors.request.use(async (config) => {
  const method = config.method.toLowerCase();
  if (!['get', 'head'].includes(method)) {
    // Appel direct à axios natif (sans baseURL) pour éviter la récursion
    await axios.get('http://public.test/api/sanctum/csrf-cookie', {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
  }
  return config;
});

export default api;
