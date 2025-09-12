// Services pour les produits
import { api } from './client'
import { normalizeProductsResponse } from './normalizers'

export const productService = {
  async getProducts(filters = {}) {
    try {
      // Harmonisation des clés attendues par le backend
      const {
        searchTerm,
        search,
        q,
        category,
        page,
        per_page,
        sort_by,
        sort_direction,
        sort,
        direction,
        status,
        ...rest
      } = filters

      const params = {
        page: page ?? filters.currentPage ?? 1,
        per_page: per_page ?? filters.perPage ?? filters.limit ?? 12,
        // Priorité: q (déjà correct) sinon searchTerm/search
        q: q ?? searchTerm ?? search ?? undefined,
        category: category === 'all' ? undefined : category,
        status: status === 'all' ? undefined : status,
        sort_by: sort_by || sort || undefined,
        sort_direction: sort_direction || direction || undefined,
        ...rest
      }

      const response = await api.products.getAll(params)
      const { items, pagination } = normalizeProductsResponse(response.data)
      return {
        success: true,
        data: {
          items,
          pagination,
          raw: response.data
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des produits'
      }
    }
  },

  async getProduct(id) {
    try {
      const response = await api.products.getById(id)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Produit non trouvé'
      }
    }
  },

  async getProductReviews(productId) {
    try {
      const response = await api.products.getReviews(productId)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des avis'
      }
    }
  },

  async addReview(productId, review) {
    try {
      const response = await api.products.addReview(productId, review)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'ajout de l\'avis',
        errors: error.formattedErrors
      }
    }
  }
}

export const categoryService = {
  async getCategories() {
    try {
      const response = await api.categories.getAll()
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors du chargement des catégories'
      }
    }
  },

  async getCategory(id) {
    try {
      const response = await api.categories.getById(id)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Catégorie non trouvée'
      }
    }
  }
}
