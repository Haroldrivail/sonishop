// Services pour les produits
import { api } from './client'

export const productService = {
  async getProducts(filters = {}) {
    try {
      const response = await api.products.getAll(filters)
      return {
        success: true,
        data: response.data
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
