import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'
import { 
  ChevronLeftIcon,
  HeartIcon, 
  ShoppingCartIcon, 
  TruckIcon,
  ShieldCheckIcon,
  ArrowsRightLeftIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon
} from '../components/icons'

const ProductDetail = () => {
  const { id } = useParams()
  const { addToCart, toggleWishlist, isInWishlist } = useCart()
  const { showCartNotification, showSuccess, showError } = useNotification() // legacy notifications (cart special)
  const { showToast } = useToast()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState(null)

  // Fallback minimal: aucune donnée persistante hardcodée
  const buildMappedProduct = (p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.slug || p.category?.name || p.category_id,
    price: p.price,
    originalPrice: p.sale_price ? p.price : null,
    discount: p.sale_price ? Math.round(((p.price - p.sale_price)/p.price)*100) : null,
    images: p.images?.length ? p.images : [p.image_url || p.image].filter(Boolean),
    rating: p.rating,
    reviews: p.reviews_count,
    inStock: p.in_stock,
    stockCount: p.stock_count ?? 1,
    isNew: p.is_new,
    badge: p.is_new ? 'Nouveau' : null,
    description: p.description,
    features: [],
    specifications: {},
    relatedProducts: [],
  })

  // Charger les détails du produit depuis l'API
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtenir les détails du produit
        const response = await api.products.getById(id);
        if (response.data) {
          const raw = response.data.data || response.data
          const mapped = buildMappedProduct(raw)
          setProduct(mapped)
          // Produits associés: placeholder vide jusqu'à endpoint dédié
          setRelatedProducts([])
        } else throw new Error('Données du produit invalides')
      } catch (err) {
        console.error('Erreur lors du chargement des détails du produit:', err);
        setError('Impossible de charger les détails du produit.');
        setProduct(null);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
  if (product && newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
  if (!product?.inStock || isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      // Si l'API est disponible, utiliser la méthode du service
      if (api.cart && api.cart.addItem) {
        try {
          await api.cart.addItem(product.id, quantity);
          showToast({ type: 'success', title: 'Ajouté au panier', description: `${quantity} x ${product.name}` })
        } catch (apiError) {
          console.error('API error:', apiError);
          // En cas d'erreur API, utiliser la méthode locale
          const success = addToCart(product, quantity);
          if (success) {
            showToast({ type: 'success', title: 'Ajouté au panier (local)', description: `${quantity} x ${product.name}` })
          }
        }
      } else {
        // Méthode locale de secours
        const success = addToCart(product, quantity);
        if (success) {
          showToast({ type: 'success', title: 'Ajouté au panier', description: `${quantity} x ${product.name}` })
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      showToast({ type: 'error', title: 'Erreur panier', description: 'Ajout impossible' })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    const res = await toggleWishlist(product)
    if (res?.attached) {
      showToast({ type: 'info', title: 'Favori ajouté', description: product.name })
    } else {
      showToast({ type: 'info', title: 'Favori retiré', description: product.name })
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur</h2>
            <p className="mb-4">{error}</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => window.history.back()} 
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Retour
              </button>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-300 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Produit non trouvé</h2>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-soni-navy text-white rounded-lg hover:bg-soni-navy/90 transition-colors"
          >
            <ChevronLeftIcon className="mr-2 w-4 h-4" />
            Retour au catalogue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-soni-navy transition-colors">Accueil</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-soni-navy transition-colors">Produits</Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          to="/products"
          className="inline-flex items-center text-soni-navy hover:text-soni-navy/80 transition-colors mb-8"
        >
          <ChevronLeftIcon className="mr-2 w-5 h-5" />
          Retour au catalogue
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'border-soni-orange shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                {product.badge && (
                  <span className="px-3 py-1 bg-soni-orange text-white text-sm font-semibold rounded-full">
                    {product.badge}
                  </span>
                )}
                {product.isNew && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full">
                    Nouveau
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-soni-navy font-medium">{product.category}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(product.rating)}
                </div>
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-gray-600">({product.reviews} avis)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="price-fcfa-large text-soni-navy">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through price-fcfa">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                    -{product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckIcon className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">
                    En stock ({product.stockCount} disponibles)
                  </span>
                </>
              ) : (
                <span className="text-red-600 font-medium">Rupture de stock</span>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantité:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stockCount}
                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAddingToCart}
                  className="group w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-bold rounded-xl text-white bg-blue-800 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-soni-navy/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform active:scale-[0.98] hover:cursor-pointer mb-2"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <HeartIcon
                    className={`w-6 h-6 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                    filled={isInWishlist(product.id)}
                  />
                </button>
                <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <ShareIcon className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckIcon className="w-5 h-5 text-green-500" />
                Avantages inclus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <TruckIcon className="w-6 h-6 text-soni-orange" />
                  <div>
                    <div className="font-medium text-sm">Livraison gratuite</div>
                    <div className="text-xs text-gray-600">Sous 48h</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-soni-orange" />
                  <div>
                    <div className="font-medium text-sm">Garantie 2 ans</div>
                    <div className="text-xs text-gray-600">Constructeur</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ArrowsRightLeftIcon className="w-6 h-6 text-soni-orange" />
                  <div>
                    <div className="font-medium text-sm">Retour gratuit</div>
                    <div className="text-xs text-gray-600">30 jours</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'features', label: 'Caractéristiques' },
                { id: 'specs', label: 'Spécifications' },
                { id: 'reviews', label: 'Avis' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-soni-orange text-soni-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="px-6 py-4 flex justify-between">
                      <dt className="font-medium text-gray-900">{key}</dt>
                      <dd className="text-gray-700 text-right">{value}</dd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <p className="text-gray-600">Les avis clients seront bientôt disponibles.</p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Produits complémentaires</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {product.relatedProducts.map(relatedProduct => (
                <Link
                  key={relatedProduct.id}
                  to={`/products/${relatedProduct.id}`}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-soni-navy transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="price-fcfa-small text-soni-navy">
                      {formatPrice(relatedProduct.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
