import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useNotification } from '../context/NotificationContext'
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
  const { showCartNotification, showSuccess, showError } = useNotification()
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [loading, setLoading] = useState(true)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Données simulées d'un produit
  const mockProduct = {
    id: 1,
    name: 'iPhone 15 Pro Max',
    category: 'Smartphones',
    price: 850000,
    originalPrice: 915000,
    discount: 7,
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600',
      'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=600'
    ],
    rating: 4.8,
    reviews: 324,
    inStock: true,
    stockCount: 12,
    isNew: true,
    badge: 'Bestseller',
    description: "L'iPhone 15 Pro Max redéfinit l'innovation mobile avec son design en titane, son écran Super Retina XDR de 6,7 pouces et sa puce A17 Pro révolutionnaire. Capturez des moments extraordinaires avec son système de caméra pro avancé et profitez d'une autonomie exceptionnelle.",
    features: [
      'Écran Super Retina XDR 6,7 pouces',
      'Puce A17 Pro avec GPU 6 cœurs',
      'Système de caméra Pro 48 MP',
      'Design en titane de qualité aérospatiale',
      'USB-C avec USB 3',
      'Face ID',
      'Résistance à l\'eau IP68',
      'MagSafe et charge sans fil Qi'
    ],
    specifications: {
      'Écran': 'Super Retina XDR OLED 6,7" (2796 × 1290)',
      'Processeur': 'Puce A17 Pro',
      'Stockage': '256 GB',
      'Caméra': '48 MP principale + 12 MP ultra grand-angle + 12 MP téléobjectif',
      'Batterie': 'Jusqu\'à 29h de lecture vidéo',
      'Connectivité': '5G, Wi-Fi 6E, Bluetooth 5.3',
      'Dimensions': '159,9 × 76,7 × 8,25 mm',
      'Poids': '221 g'
    },
    relatedProducts: [
      {
        id: 2,
        name: 'AirPods Pro 2',
        price: 163000,
        image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=300'
      },
      {
        id: 3,
        name: 'MagSafe Charger',
        price: 25500,
        image: 'https://images.unsplash.com/photo-1609205807107-e3b433c49e11?w=300'
      }
    ]
  }

  useEffect(() => {
    // Simulation du chargement
    setTimeout(() => {
      setProduct(mockProduct)
      setLoading(false)
    }, 1000)
  }, [id])

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
    if (newQuantity >= 1 && newQuantity <= product.stockCount) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    if (!product.inStock || isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      // Simulation d'un délai pour montrer l'état de chargement
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ajouter le produit au panier avec la quantité sélectionnée
      const success = addToCart(product, quantity)
      
      if (success) {
        // Afficher la notification de succès avec le produit
        showCartNotification(product, quantity)
        
        // Optionnel: Réinitialiser la quantité à 1 après ajout
        // setQuantity(1)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error)
      showError('Erreur lors de l\'ajout au panier')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleToggleFavorite = () => {
    const wasAdded = toggleWishlist(product)
    if (wasAdded) {
      showSuccess('Produit ajouté aux favoris')
    } else {
      showSuccess('Produit retiré des favoris')
    }
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
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-700 hover:bg-blue-700/90 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform disabled:transform-none cursor-pointer"
                >
                  <ShoppingCartIcon className="w-5 h-5" />
                  {isAddingToCart ? 'Ajout en cours...' : 'Ajouter au panier'}
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <HeartIcon
                    className={`w-6 h-6 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'}`}
                    filled={isInWishlist(product.id)}
                  />
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
