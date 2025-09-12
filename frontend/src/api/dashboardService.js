// Services pour le dashboard admin - Version optimisée
import { api } from './client'

export const dashboardService = {
  // 🖼️ Méthode utilitaire pour résoudre les URLs d'images
  resolveImageUrl(imageUrl) {
    if (!imageUrl) {
      return '/Produit.png' // Placeholder par défaut
    }
    
    // Si c'est déjà une URL complète, la retourner
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // Si c'est déjà un chemin relatif vers placeholder
    if (imageUrl.startsWith('/Produit.png') || imageUrl.startsWith('/Categorie.png')) {
      return imageUrl
    }
    
    // Si c'est un chemin storage Laravel, construire l'URL complète
    if (imageUrl.startsWith('/storage/')) {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      return backendUrl.replace('/api', '') + imageUrl
    }
    
    // Par défaut, retourner tel quel
    return imageUrl || '/Produit.png'
  },

  async getDashboardStats() {
    try {
      const response = await api.dashboard.getStats()
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur dashboard stats:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des statistiques'
      }
    }
  },

  async getTopProducts(limit = 8) {
    try {
      // Récupérer les produits triés par ventes
      const response = await api.products.getAll({ 
        per_page: Math.max(limit, 20), // Récupérer plus pour pouvoir trier
        sort: 'sales', 
        direction: 'desc',
        include_stats: true 
      })
      
      // ⚠️ Fallback: Si le backend ne supporte pas le tri par ventes,
      // on fait un tri côté frontend sur les données disponibles
      let productsData = []
      if (Array.isArray(response.data?.data)) {
        productsData = response.data.data
      } else if (Array.isArray(response.data)) {
        productsData = response.data
      }
      
      // Tri fallback par ID décroissant (les plus récents) en l'absence de stats ventes
      productsData = productsData
        .sort((a, b) => (b.sales || b.id || 0) - (a.sales || a.id || 0))
        .slice(0, limit)
      
      return {
        success: true,
        data: productsData
      }
    } catch (error) {
      console.error('Erreur top products:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des produits populaires'
      }
    }
  },

  async getSidebar() {
    try {
      const response = await api.dashboard.getSidebar()
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      console.error('Erreur sidebar:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement de la sidebar'
      }
    }
  },

  // Normalise les données de statistiques selon le format backend
  normalizeStats(rawStats) {
    const data = rawStats?.data || rawStats || {}
    
    return {
      // Stats principales (format backend: revenue_30d, orders_30d, etc.)
      totalRevenue: data.revenue_30d || data.totalRevenue || 0,
      totalOrders: data.orders_30d || data.totalOrders || 0,
      totalCustomers: data.new_customers_30d || data.totalCustomers || 0,
      totalProducts: data.products_count || data.totalProducts || 0,
      
      // Calcul des changements (backend ne fournit pas encore les %)
      revenueChange: data.revenue_change || this.calculateChange(data.revenue_30d, data.revenue_prev_30d),
      ordersChange: data.orders_change || this.calculateChange(data.orders_30d, data.orders_prev_30d),
      customersChange: data.customers_change || this.calculateChange(data.new_customers_30d, data.new_customers_prev_30d),
      productsChange: data.products_change || this.calculateChange(data.products_count, data.products_prev_count),
      
      // Données additionnelles
      topCategories: data.top_categories || [],
      recentOrders: data.recent_orders || []
    }
  },

  // Calcule le pourcentage de changement
  calculateChange(current, previous) {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return (change > 0 ? '+' : '') + Math.round(change) + '%'
  },

  // Normalise les données de produits avec données de vente
  normalizeProducts(rawProducts, limit = 6) {
    let productsData = []
    
    // Gestion des différents formats de réponse
    if (Array.isArray(rawProducts?.data?.data)) {
      productsData = rawProducts.data.data
    } else if (Array.isArray(rawProducts?.data)) {
      productsData = rawProducts.data
    } else if (Array.isArray(rawProducts)) {
      productsData = rawProducts
    }

    return productsData.slice(0, limit).map(product => ({
      id: product.id,
      name: product.name || 'Produit sans nom',
      sales: product.sales || 0,
      revenue: (product.sales || 0) * (product.price || 0),
      image: this.resolveImageUrl(product.image_url || product.image), // 🖼️ Résolution d'URL améliorée
      price: product.price || 0,
      stock: product.stock || 0,
      category: product.category?.name || 'Non classé'
    }))
  },

  // Normalise les données de commandes avec informations client
  normalizeOrders(rawOrders, limit = 10) {
    let ordersData = []
    
    if (Array.isArray(rawOrders?.data?.data)) {
      ordersData = rawOrders.data.data
    } else if (Array.isArray(rawOrders?.data)) {
      ordersData = rawOrders.data
    } else if (Array.isArray(rawOrders)) {
      ordersData = rawOrders
    }

    return ordersData.slice(0, limit).map(order => ({
      id: order.id,
      number: order.number || `#${order.id}`,
      customer: order.user?.name || order.customer_name || 'Client inconnu',
      customerEmail: order.user?.email || order.customer_email || '',
      amount: order.total || 0,
      status: order.status || 'pending',
      date: order.created_at || new Date().toISOString(),
      itemsCount: order.items?.length || order.items_count || 0
    }))
  },

  // Normalise les données de catégories
  normalizeCategories(rawCategories, limit = 5) {
    let categoriesData = []
    
    if (Array.isArray(rawCategories)) {
      categoriesData = rawCategories
    } else if (Array.isArray(rawCategories?.data)) {
      categoriesData = rawCategories.data
    }

    return categoriesData.slice(0, limit).map(category => ({
      id: category.id,
      name: category.name || 'Catégorie sans nom',
      revenue: category.revenue || 0,
      productsCount: category.products_count || 0
    }))
  }
}
