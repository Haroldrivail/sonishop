import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  TrashIcon,
  StarIcon,
  EyeIcon
} from '../components/icons'

const Favorites = () => {
  const { user } = useAuth()
  const { wishlist, removeFromWishlist, addToCart } = useCart()
  const { success, info } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simuler le chargement (dans une vraie app, pas besoin car les favoris sont déjà dans le contexte)
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  const handleRemoveFromFavorites = (productId) => {
    removeFromWishlist(productId)
    info('Produit retiré des favoris')
  }

  const handleAddToCart = (product) => {
    const success_add = addToCart(product)
    if (success_add) {
      success(`${product.name} ajouté au panier !`)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA'
  }

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
                Mes Favoris
              </h1>
              <p className="text-gray-600 mt-2">
                {wishlist.length} {wishlist.length === 1 ? 'produit favori' : 'produits favoris'}
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Connecté en tant que</p>
                <p className="font-semibold text-[#1a237e]">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        {wishlist.length === 0 ? (
          // État vide
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Aucun produit en favoris
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explorez notre catalogue et ajoutez vos produits préférés en cliquant sur l'icône cœur
            </p>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 bg-[#1a237e] text-white font-medium rounded-lg hover:bg-blue-800 transition-colors duration-200"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          // Liste des favoris
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Image du produit */}
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  
                  {/* Badge de réduction */}
                  {product.discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      -{product.discount}%
                    </div>
                  )}
                  
                  {/* Bouton supprimer des favoris */}
                  <button
                    onClick={() => handleRemoveFromFavorites(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors duration-200 group"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 group-hover:text-red-600" />
                  </button>
                </div>

                {/* Informations du produit */}
                <div className="p-6">
                  {/* Nom et marque */}
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                  </div>

                  {/* Note et avis */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {product.rating} ({product.reviews} avis)
                    </span>
                  </div>

                  {/* Prix */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-[#1a237e]">
                        {formatPrice(product.salePrice || product.price)}
                      </span>
                      {product.salePrice && product.price > product.salePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Disponibilité */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'En stock' : 'Rupture de stock'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-[#ff6d00] text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      <span>Ajouter</span>
                    </button>
                    
                    <Link
                      to={`/products/${product.id}`}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {wishlist.length > 0 && (
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Continuer vos achats
            </h3>
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-[#1a237e] text-[#1a237e] font-medium rounded-lg hover:bg-[#1a237e] hover:text-white transition-colors duration-200"
            >
              Voir tous les produits
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
