// Services pour les catégories
import { api } from './client'

export const categoryService = {
  async getCategories() {
    try {
      const response = await api.categories.getAll()
      return {
        success: true,
        data: response.data.data || response.data || []
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
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Catégorie non trouvée'
      }
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.categories.create(categoryData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la création de la catégorie',
        errors: error.response?.data?.errors
      }
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const response = await api.categories.update(id, categoryData)
      return {
        success: true,
        data: response.data.data || response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de la catégorie',
        errors: error.response?.data?.errors
      }
    }
  },

  async deleteCategory(id) {
    try {
      const response = await api.categories.delete(id)
      return {
        success: true,
        message: response.data.message || 'Catégorie supprimée avec succès'
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la suppression de la catégorie'
      }
    }
  },

  async updateCategoryImage(id, imageData) {
    try {
      const response = await api.categories.updateImage(id, imageData)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de la mise à jour de l\'image'
      }
    }
  }
}
