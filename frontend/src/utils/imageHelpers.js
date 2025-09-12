// 🖼️ Utilitaires globaux pour la gestion des images dans SoniShop

/**
 * Résout une URL d'image en fonction du contexte (backend/frontend/placeholder)
 * @param {string|null} imageUrl - URL de l'image à résoudre
 * @param {string} fallback - Image de fallback ('/Produit.png' par défaut)
 * @returns {string} - URL résolue
 */
export const resolveImageUrl = (imageUrl, fallback = '/Produit.png') => {
  if (!imageUrl) {
    return fallback
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
  
  // Par défaut, retourner tel quel ou le fallback si null
  return imageUrl || fallback
}

/**
 * Gère l'erreur de chargement d'image et bascule vers le placeholder
 * @param {Event} event - Événement onError de l'image
 * @param {string} fallback - Image de fallback
 */
export const handleImageError = (event, fallback = '/Produit.png') => {
  if (event.target.src !== fallback) {
    event.target.src = fallback
  }
}

/**
 * Précharge une image pour éviter les erreurs de chargement
 * @param {string} imageUrl - URL de l'image à précharger
 * @param {string} fallback - Image de fallback si le chargement échoue
 * @returns {Promise<string>} - Promise qui résout avec l'URL valide
 */
export const preloadImage = (imageUrl, fallback = '/Produit.png') => {
  return new Promise((resolve) => {
    if (!imageUrl) {
      resolve(fallback)
      return
    }
    
    const img = new Image()
    img.onload = () => resolve(imageUrl)
    img.onerror = () => resolve(fallback)
    img.src = resolveImageUrl(imageUrl, fallback)
  })
}

/**
 * Composant Image optimisé avec gestion d'erreurs automatique
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  fallback = '/Produit.png', 
  className = '',
  ...props 
}) => {
  const resolvedSrc = resolveImageUrl(src, fallback)
  
  return (
    <img 
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={(e) => handleImageError(e, fallback)}
      {...props}
    />
  )
}

export default {
  resolveImageUrl,
  handleImageError,
  preloadImage,
  OptimizedImage
}
