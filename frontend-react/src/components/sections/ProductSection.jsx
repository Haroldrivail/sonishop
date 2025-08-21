import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  EyeIcon,
  TagIcon,
  TruckIcon
} from '../icons'

export const transformProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: parseFloat(product.price),
  salePrice: product.sale_price ? parseFloat(product.sale_price) : null,
  image: product.image,
  category: product.category,
  rating: parseFloat(product.rating),
  reviews: product.reviews || 0,
  inStock: product.in_stock === 1,
  stock: product.stock,
  isNew: product.is_new === 1,
  freeShipping: product.free_shipping === 1,
  sales: product.sales,
  createdAt: product.created_at,
  updatedAt: product.updated_at
})

const ProductSection = ({
  title = "Nos Produits",
  subtitle = "Découvrez notre sélection",
  products = [],
  maxProducts = 8,
  showViewAll = true,
  viewAllLink = "/products",
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onVote,
}) => {
  const [hoveredProduct, setHoveredProduct] = useState(null)

  const displayProducts = products.slice(0, maxProducts)
  const IMAGE_BASE_URL = 'http://public.test/storage/'

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

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


  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {subtitle}
          </p>

          {/* Ligne décorative */}
          <div className="flex items-center justify-center">
            <div className="h-1 w-20 bg-gradient-to-r from-soni-navy to-soni-orange rounded-full"></div>
          </div>
        </div>

        {/* Grille de produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {displayProducts.map(product => {
            const isInWishlist = wishlist.includes(product.id)
            const hasDiscount = product.salePrice && product.salePrice < product.price
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.salePrice) / product.price) * 100)
              : 0
            const isHovered = hoveredProduct === product.id

            return (
              <div
                key={product.id}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image du produit */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={`${IMAGE_BASE_URL}${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />



                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    {hasDiscount && (
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <TagIcon className="w-3 h-3" />
                        -{discountPercent}%
                      </div>
                    )}
                    {product.isNew && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Nouveau
                      </div>
                    )}
                    {product.freeShipping && (
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <TruckIcon className="w-3 h-3" />
                        Livraison gratuite
                      </div>
                    )}
                  </div>

                  {/* Actions hover */}
                  <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <button
                      onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${isInWishlist
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
                  <div className={`absolute bottom-3 left-3 right-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <button
                      onClick={() => onAddToCart && onAddToCart(product)}
                      disabled={!product.inStock}
                      className="w-full bg-soni-orange text-white py-2 px-4 rounded-lg hover:bg-soni-orange/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCartIcon className="w-4 h-4" />
                      {product.inStock ? 'Ajouter au panier' : 'Rupture de stock'}
                    </button>
                  </div>
                </div>

                {/* Informations du produit */}
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

                  {/* Rating */}
                  {typeof product.rating === 'number' && (
                    <div className="mb-3">
                      {renderStars(product.rating)}
                    </div>
                  )}
                  {/* Interaction : voter */}
                  <div className="mt-2">
                    <span className="text-sm text-gray-600 mr-2">Notez ce produit :</span>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          console.log("Vote button clicked!", product.id);

                          onVote && onVote(product.id, value)
                        }}
                        className="text-yellow-400 hover:text-yellow-500"
                      >
                        ★
                      </button>
                    ))}
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
                        <span className="text-green-600 font-medium">En stock</span>
                      ) : (
                        <span className="text-red-600 font-medium">Rupture</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bouton "Voir tout" */}
        {showViewAll && (
          <div className="text-center">
            <Link
              to={viewAllLink}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300 transform shadow-lg hover:shadow-xl"
            >
              Voir tous les produits
              <ArrowRightIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

export default ProductSection
