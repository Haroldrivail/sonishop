// Central definition of API endpoints for easy reuse & refactoring
// Only base path segments here – composing with ids / params happens in services

export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    reviews: (id) => `/products/${id}/reviews`,
  image: (id) => `/products/${id}/image`, // public (non utilisé côté admin)
  stock: (id) => `/admin/products/${id}/stock`
  },
  categories: {
    list: '/categories',
    detail: (id) => `/categories/${id}`,
  },
  cart: {
    base: '/cart',
    items: '/cart/items',
    item: (id) => `/cart/items/${id}`,
    sync: '/cart/sync',
  },
  orders: {
    list: '/orders',
    detail: (id) => `/orders/${id}`,
  },
  wishlist: {
    list: '/wishlist',
    toggle: (id) => `/wishlist/${id}`,
  },
  profile: {
    base: '/settings/profile',
    password: '/settings/password',
  },
  addresses: {
    list: '/addresses',
    detail: (id) => `/addresses/${id}`,
  },
  notifications: {
    list: '/notifications',
    detail: (id) => `/notifications/${id}`,
    markRead: (id) => `/notifications/${id}/read`,
    markAll: '/notifications/read-all',
  },
  contact: '/contact',
  promo: '/promo/validate',
  uploads: {
    upload: '/uploads',
    avatar: '/uploads/avatar',
    presign: '/uploads/presign',
  },
  dashboard: {
    sidebar: '/dashboard/sidebar', // devrait retourner un tableau d'items { id,label,icon }
    stats: '/dashboard/stats' // indicateurs clés pour l'overview
  },
  admin: {
    analytics: {
      summary: '/admin/analytics/summary',
      exportCsv: '/admin/analytics/export/csv',
      exportPdf: '/admin/analytics/export/pdf'
    },
    orders: {
  list: '/admin/orders',
  detail: (id) => `/admin/orders/${id}`,
  updateStatus: (id) => `/admin/orders/${id}/status`,
  refund: (id) => `/admin/orders/${id}/refund`,
  addNote: (id) => `/admin/orders/${id}/notes`,
  resendEmail: (id) => `/admin/orders/${id}/resend-email`,
  bulkStatus: '/admin/orders/bulk/status',
  bulkCancel: '/admin/orders/bulk/cancel'
    },
    products: {
      list: '/products', // Les routes admin utilisent les mêmes endpoints que public
      create: '/admin/products',
      detail: (id) => `/admin/products/${id}`,
      image: (id) => `/admin/products/${id}/image`,
      stock: (id) => `/admin/products/${id}/stock`,
    },
    categories: {
      base: '/admin/categories',
      detail: (id) => `/admin/categories/${id}`
    },
    settings: {
      general: '/admin/settings/general',
      profile: '/admin/settings/profile',
      security: '/admin/settings/security',
      notifications: '/admin/settings/notifications',
      shop: '/admin/settings/shop',
      billing: '/admin/settings/billing',
      sessions: '/admin/settings/sessions',
      password: '/admin/settings/password'
    }
  }
}

export default ENDPOINTS