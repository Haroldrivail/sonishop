import axios from 'axios';

// Crée une instance Axios
const api = axios.create({
  baseURL: 'http://public.test/api',
  withCredentials: true, // Obligatoire pour envoyer les cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajoute automatiquement le token CSRF dans le header si dispo
api.interceptors.request.use((config) => {
  const token = getCookie('XSRF-TOKEN');
  if (token) {
    config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
  }
  return config;
});

function getCookie(name) {
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(name + '='));
  return cookie ? cookie.split('=')[1] : null;
}

export default api;
