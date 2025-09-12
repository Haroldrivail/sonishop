// Service pour gérer les uploads d'images
import { api } from './client'

export const uploadService = {
  /**
   * Upload d'un fichier unique
   * @param {File} file - Le fichier à uploader
   * @param {string} folder - Le dossier de destination (products, categories, avatars, etc.)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async uploadFile(file, folder = 'uploads') {
    try {
      if (!file) {
        return {
          success: false,
          error: 'Aucun fichier sélectionné'
        }
      }

      // Validation côté client
      const maxSize = 5 * 1024 * 1024 // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']

      if (file.size > maxSize) {
        return {
          success: false,
          error: 'Le fichier ne peut pas dépasser 5MB'
        }
      }

      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: 'Format de fichier non supporté. Utilisez JPG, PNG, WebP, SVG ou GIF'
        }
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await api.uploads.upload(formData)
      
      return {
        success: true,
        data: {
          url: response.data.data?.url || response.data.url,
          path: response.data.data?.path || response.data.path
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'upload du fichier'
      }
    }
  },

  /**
   * Upload multiple files
   * @param {FileList|File[]} files - Les fichiers à uploader
   * @param {string} folder - Le dossier de destination
   * @returns {Promise<{success: boolean, data?: any[], errors?: string[]}>}
   */
  async uploadMultipleFiles(files, folder = 'uploads') {
    try {
      const uploads = Array.from(files).map(file => this.uploadFile(file, folder))
      const results = await Promise.all(uploads)
      
      const successful = results.filter(result => result.success)
      const failed = results.filter(result => !result.success)
      
      return {
        success: successful.length > 0,
        data: successful.map(result => result.data),
        errors: failed.map(result => result.error),
        totalCount: files.length,
        successCount: successful.length,
        failCount: failed.length
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur lors de l\'upload multiple'
      }
    }
  },

  /**
   * Upload d'avatar utilisateur
   * @param {File} file - Le fichier avatar
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  async uploadAvatar(file) {
    try {
      const result = await this.uploadFile(file, 'avatars')
      if (result.success) {
        // L'API met automatiquement à jour l'avatar de l'utilisateur connecté
        return result
      }
      return result
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur lors de l\'upload de l\'avatar'
      }
    }
  },

  /**
   * Validation d'URL d'image externe
   * @param {string} url - L'URL à valider
   * @returns {boolean}
   */
  isValidImageUrl(url) {
    if (!url) return false
    
    // Vérifier si c'est une URL valide
    try {
      new URL(url)
    } catch {
      return false
    }

    // Vérifier l'extension
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif']
    const urlLower = url.toLowerCase()
    
    return imageExtensions.some(ext => urlLower.includes(ext)) || 
           urlLower.includes('image') || 
           urlLower.includes('photo')
  },

  /**
   * Prévisualisation d'image avant upload
   * @param {File} file - Le fichier image
   * @returns {Promise<string>} - Data URL pour prévisualisation
   */
  async previewFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Le fichier n\'est pas une image'))
        return
      }

      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },

  /**
   * Redimensionner une image côté client avant upload
   * @param {File} file - Le fichier image
   * @param {number} maxWidth - Largeur maximale
   * @param {number} maxHeight - Hauteur maximale
   * @param {number} quality - Qualité de compression (0.1 à 1.0)
   * @returns {Promise<File>} - Le fichier redimensionné
   */
  async resizeImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculer les nouvelles dimensions
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = height * (maxWidth / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = width * (maxHeight / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en Blob puis en File
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          })
          resolve(resizedFile)
        }, file.type, quality)
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
}
