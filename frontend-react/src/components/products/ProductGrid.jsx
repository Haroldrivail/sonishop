import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import {
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  TruckIcon,
  SearchIcon,
  TagIcon,
  ClockIcon
} from '../icons'

const ProductGrid = ({ products = [], onVote }) => {
const [viewMode, setViewMode] = useState('grid') // 'grid' ou 'list'
const { addToCart, toggleWishlist, isInWishlist } = useCart()
const { success, info } = useToast()

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}
const IMAGE_BASE_URL = 'http://public.test/storage/'


const renderStars = (rating) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  )
}

const ProductCard = ({ product = [], onVote }) => {
  const stars = []
  const roundedRating = Math.round(product.rating)
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= roundedRating ? "text-yellow-400" : "text-gray-300"}>
        &#9733;
      </span>
    )
  }
  const isProductInWishlist = isInWishlist(product.id)
  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    const success_add = addToCart(product)
    if (success_add) {
      success(`${product.name} ajouté au panier`)
    }
  }

  const handleToggleWishlist = () => {
    const added = toggleWishlist(product)
    if (added) {
      info(`${product.name} ajouté aux favoris`)
    } else {
      info(`${product.name} retiré des favoris`)
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 group">
        <div className="flex gap-4">
          {/* Image */}
          <div className="relative flex-shrink-0 w-32 h-32">
            <img
              src={product.image ? `${IMAGE_BASE_URL}${product.image}` : 'fallback-image.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />

            {hasDiscount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{discountPercent}%
              </div>
            )}
            {product.isNew && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                Nouveau
              </div>
            )}
          </div>

          {/* Contenu */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-soni-navy transition-colors line-clamp-2"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <button
                  onClick={handleToggleWishlist}
                  className={`p-2 rounded-full transition-colors ${isProductInWishlist
                    ? 'text-red-500 bg-red-50'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                >
                  <HeartIcon className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-2">
                {typeof product.rating === 'number' && renderStars(product.rating)}
                {product.freeShipping && (
                  <div className="flex items-center text-green-600 text-sm">
                    <TruckIcon className="w-4 h-4 mr-1" />
                    Livraison gratuite
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                {hasDiscount ? (
                  <>
                    <span className="text-xl font-bold text-soni-orange">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/products/${product.id}`}
                  className="p-2 text-gray-400 hover:text-soni-navy transition-colors"
                >
                  <EyeIcon className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleAddToCart}
                  className="bg-soni-orange text-white px-4 py-2 rounded-lg hover:bg-soni-orange/90 transition-colors flex items-center gap-2"
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Mode grille (par défaut)
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image ? `${IMAGE_BASE_URL}${product.image}` : 'fallback-image.png'}
          alt={product.name}
          className="w-full h-full object-cover"
        />


        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hasDiscount && (
            <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              -{discountPercent}%
            </div>
          )}
          {product.isNew && (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              Nouveau
            </div>
          )}
        </div>

        {/* Actions hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isProductInWishlist
              ? 'text-red-500 bg-white/90'
              : 'text-gray-600 bg-white/90 hover:text-red-500'
              }`}
          >
            <HeartIcon className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          <Link
            to={`/products/${product.id}`}
            className="p-2 rounded-full bg-white/90 text-gray-600 hover:text-soni-navy transition-colors"
          >
            <EyeIcon className="w-5 h-5" />
          </Link>
        </div>

        {/* Bouton d'achat rapide */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="w-full bg-soni-orange text-white py-2 px-4 rounded-lg hover:bg-soni-orange/90 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-4">
        <Link
          to={`/products/${product.id}`}
          className="block text-lg font-semibold text-gray-900 hover:text-soni-navy transition-colors line-clamp-2 mb-2"
        >
          {product.name}
        </Link>

        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Rating et livraison */}
        <div className="flex items-center justify-between mb-3">
          {typeof product.rating === 'number' && renderStars(product.rating)}

          {product.freeShipping && (
            <div className="flex items-center text-green-600 text-xs">
              <TruckIcon className="w-3 h-3 mr-1" />
              Livraison gratuite
            </div>
          )}
        </div>

        {/* Prix */}
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex flex-col">
                <span className="text-lg font-bold text-soni-orange">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {product.inStock !== false ? (
              <span className="text-green-600">En stock</span>
            ) : (
              <span className="text-red-600">Rupture</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

if (products.length === 0) {
  return (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <SearchIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
      <p className="text-gray-600 mb-4">
        Essayez de modifier vos critères de recherche ou de navigation.
      </p>
    </div>
  )
}

return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* En-tête avec toggle vue */}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-bold text-gray-900">
        Produits ({products.length})
      </h2>

      {/* Toggle vue grille/liste */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode('grid')}
          className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'grid'
            ? 'bg-white text-soni-navy shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Grille
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-3 py-1 rounded text-sm transition-colors ${viewMode === 'list'
            ? 'bg-white text-soni-navy shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Liste
        </button>
      </div>
    </div>

    {/* Grille de produits */}
    <div className={
      viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'space-y-4'
    }>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
)
}

export default ProductGrid
