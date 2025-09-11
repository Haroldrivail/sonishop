import axios from 'axios'
import { ENDPOINTS } from './endpoints'
import { mockSettingsAPI } from './mockSettingsData'

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
// Utilisation explicite du mock: seulement si VITE_USE_MOCK_SETTINGS === 'true'
// (évite les erreurs aléatoires de simulation en production ou dev normal)
const USE_MOCK_SETTINGS = import.meta.env.VITE_USE_MOCK_SETTINGS === 'true'

// Créer une instance axios
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Pas besoin des cookies avec l'authentification par token
})

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gérer les erreurs d'authentification
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Gérer les erreurs de validation
    if (error.response?.status === 422) {
      // Erreurs de validation Laravel
      const errors = error.response.data.errors
      if (errors) {
        // Transformer les erreurs Laravel en format plus utilisable
        const formattedErrors = {}
        Object.keys(errors).forEach(field => {
          formattedErrors[field] = errors[field][0] // Prendre le premier message d'erreur
        })
        error.response.data.formattedErrors = formattedErrors
      }
    }
    
    return Promise.reject(error)
  }
)

// Fonctions utilitaires pour les appels API
export const api = {
  // Auth
  auth: {
  login: (credentials) => apiClient.post(ENDPOINTS.auth.login, credentials),
  register: (userData) => apiClient.post(ENDPOINTS.auth.register, userData),
  logout: () => apiClient.post(ENDPOINTS.auth.logout),
  me: () => apiClient.get(ENDPOINTS.auth.me),
  forgotPassword: (email) => apiClient.post(ENDPOINTS.auth.forgotPassword, { email }),
  resetPassword: (data) => apiClient.post(ENDPOINTS.auth.resetPassword, data),
  },

  // Products
  products: {
  getAll: (params) => apiClient.get(ENDPOINTS.products.list, { params }),
  getById: (id) => apiClient.get(ENDPOINTS.products.detail(id)),
  getReviews: (productId) => apiClient.get(ENDPOINTS.products.reviews(productId)),
  addReview: (productId, review) => apiClient.post(ENDPOINTS.products.reviews(productId), review),
  create: (data) => apiClient.post(ENDPOINTS.products.list, data),
  update: (id, data) => apiClient.put(ENDPOINTS.products.detail(id), data),
  delete: (id) => apiClient.delete(ENDPOINTS.products.detail(id)),
  },

  // Categories
  categories: {
  getAll: () => apiClient.get(ENDPOINTS.categories.list),
  getById: (id) => apiClient.get(ENDPOINTS.categories.detail(id)),
  create: (data) => apiClient.post(ENDPOINTS.categories.list, data),
  update: (id, data) => apiClient.put(ENDPOINTS.categories.detail(id), data),
  delete: (id) => apiClient.delete(ENDPOINTS.categories.detail(id)),
  },

  // Cart
  cart: {
  get: () => apiClient.get(ENDPOINTS.cart.base),
  addItem: (productId, quantity = 1) => apiClient.post(ENDPOINTS.cart.items, { product_id: productId, quantity }),
  updateItem: (itemId, quantity) => apiClient.patch(ENDPOINTS.cart.item(itemId), { quantity }),
  removeItem: (itemId) => apiClient.delete(ENDPOINTS.cart.item(itemId)),
  sync: (items) => apiClient.post(ENDPOINTS.cart.sync, { items }),
  },

  // Orders
  orders: {
  getAll: () => apiClient.get(ENDPOINTS.orders.list),
  getById: (id) => apiClient.get(ENDPOINTS.orders.detail(id)),
  create: (orderData) => apiClient.post(ENDPOINTS.orders.list, orderData),
  },

  // Wishlist
  wishlist: {
  getAll: () => apiClient.get(ENDPOINTS.wishlist.list),
  toggle: (productId) => apiClient.post(ENDPOINTS.wishlist.toggle(productId)),
  },

  // Profile
  profile: {
  get: () => apiClient.get(ENDPOINTS.profile.base),
  update: (data) => apiClient.patch(ENDPOINTS.profile.base, data),
  delete: () => apiClient.delete(ENDPOINTS.profile.base),
  updatePassword: (data) => apiClient.put(ENDPOINTS.profile.password, data),
  },

  // Address
  addresses: {
  getAll: () => apiClient.get(ENDPOINTS.addresses.list),
  create: (address) => apiClient.post(ENDPOINTS.addresses.list, address),
  update: (id, address) => apiClient.patch(ENDPOINTS.addresses.detail(id), address),
  delete: (id) => apiClient.delete(ENDPOINTS.addresses.detail(id)),
  },

  // Notifications
  notifications: {
  getAll: () => apiClient.get(ENDPOINTS.notifications.list),
  markAsRead: (id) => apiClient.post(ENDPOINTS.notifications.markRead(id)),
  markAllAsRead: () => apiClient.post(ENDPOINTS.notifications.markAll),
  delete: (id) => apiClient.delete(ENDPOINTS.notifications.detail(id)),
  },

  // Contact
  contact: {
  send: (data) => apiClient.post(ENDPOINTS.contact, data),
  },

  // Promo codes
  promo: {
  validate: (code) => apiClient.post(ENDPOINTS.promo, { code }),
  },

  // File uploads
  uploads: {
    upload: (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return apiClient.post(ENDPOINTS.uploads.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    uploadAvatar: (file) => {
      const formData = new FormData()
  // Backend renvoie 422 "The file field is required." => champ attendu: 'file'
  formData.append('file', file)
  formData.append('folder', 'avatars')
      return apiClient.post(ENDPOINTS.uploads.avatar, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    getPresignedUrl: (filename) => apiClient.get(ENDPOINTS.uploads.presign, { params: { filename } }),
  },

  // Dashboard (items dynamiques + stats)
  dashboard: {
    getSidebar: () => apiClient.get(ENDPOINTS.dashboard.sidebar),
    getStats: () => apiClient.get(ENDPOINTS.dashboard.stats),
  },

  // Admin
  admin: {
    orders: {
      getAll: (params) => apiClient.get(ENDPOINTS.admin.orders.list, { params }),
    },
    settings: {
      getGeneralSettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getGeneralSettings() : apiClient.get(ENDPOINTS.admin.settings.general),
      updateGeneralSettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateGeneralSettings(data) : apiClient.put(ENDPOINTS.admin.settings.general, data),
      getProfileSettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getProfileSettings() : apiClient.get(ENDPOINTS.admin.settings.profile),
      updateProfileSettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateProfileSettings(data) : apiClient.put(ENDPOINTS.admin.settings.profile, data),
      getSecuritySettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getSecuritySettings() : apiClient.get(ENDPOINTS.admin.settings.security),
      updateSecuritySettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateSecuritySettings(data) : apiClient.put(ENDPOINTS.admin.settings.security, data),
      getNotificationSettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getNotificationSettings() : apiClient.get(ENDPOINTS.admin.settings.notifications),
      updateNotificationSettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateNotificationSettings(data) : apiClient.put(ENDPOINTS.admin.settings.notifications, data),
      getShopSettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getShopSettings() : apiClient.get(ENDPOINTS.admin.settings.shop),
      updateShopSettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateShopSettings(data) : apiClient.put(ENDPOINTS.admin.settings.shop, data),
      getBillingSettings: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getBillingSettings() : apiClient.get(ENDPOINTS.admin.settings.billing),
      updateBillingSettings: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updateBillingSettings(data) : apiClient.put(ENDPOINTS.admin.settings.billing, data),
      getSessions: () => USE_MOCK_SETTINGS ? mockSettingsAPI.getSessions() : apiClient.get(ENDPOINTS.admin.settings.sessions),
      deleteSession: (sessionId) => USE_MOCK_SETTINGS ? mockSettingsAPI.deleteSession(sessionId) : apiClient.delete(`${ENDPOINTS.admin.settings.sessions}/${sessionId}`),
      updatePassword: (data) => USE_MOCK_SETTINGS ? mockSettingsAPI.updatePassword(data) : apiClient.put(ENDPOINTS.admin.settings.password, data)
    },
  },
}

// Export par défaut
export default api
