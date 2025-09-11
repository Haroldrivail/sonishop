import React, { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRightIcon, ShoppingCartIcon, HeartIcon, UserIcon, CheckIcon } from '../components/icons'
import ProductSection from '../components/sections/ProductSection'
import FeaturedCategories from '../components/sections/FeaturedCategories'
import SpecialOffers from '../components/sections/SpecialOffers'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

const Home = () => {
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [searchParams, setSearchParams] = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  // Dynamic data
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Gestion de l'authentification après vérification d'email
  useEffect(() => {
    const token = searchParams.get('token')
    const verified = searchParams.get('verified')
    const alreadyVerified = searchParams.get('already_verified')

    if (token && (verified || alreadyVerified)) {
      // Authentifier l'utilisateur avec le token
      login(token)
      
      // Nettoyer l'URL
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('token')
      newSearchParams.delete('verified')
      newSearchParams.delete('already_verified')
      setSearchParams(newSearchParams, { replace: true })
      
      // Afficher un message de succès
      if (verified) {
        // Vous pouvez ajouter une notification ici
        console.log('Email vérifié avec succès!')
      } else if (alreadyVerified) {
        console.log('Email déjà vérifié!')
      }
    }
  }, [searchParams, login, setSearchParams])

  const mapProduct = useCallback((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.slug,
    price: p.price,
    salePrice: p.sale_price,
    image: p.image_url || p.image,
    description: p.description,
    rating: p.rating,
    reviews: p.reviews_count,
    inStock: p.in_stock,
    isNew: p.is_new,
    freeShipping: p.free_shipping,
    sales: p.sales
  }), [])

  // Fetch categories & products for home sections
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [catRes, prodRes] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll({ per_page: 48 })
        ])
        if (cancelled) return
        const cats = catRes.data?.data || []
        const prodsRaw = prodRes.data?.data || prodRes.data?.data?.data || prodRes.data?.data || [] // handle paginator shape
        // If paginator: prodRes.data.data is array & prodRes.data.meta exists
        const rawList = Array.isArray(prodsRaw) ? prodsRaw : []
        const mapped = rawList.map(mapProduct)
        setCategories(cats)
        setProducts(mapped)
        // Featured: top by sales then by isNew fallback
        const featured = [...mapped].sort((a,b) => (b.sales||0) - (a.sales||0)).slice(0,12)
        setFeaturedProducts(featured)
        // Offers: one discount collection & one new arrivals if available
        const discounted = mapped.filter(p => p.salePrice && p.salePrice < p.price).slice(0,8)
        const newArrivals = mapped.filter(p => p.isNew).slice(0,8)
        const offersData = []
        if (discounted.length) {
          offersData.push({
            id: 'discount',
            title: 'Offres Promotionnelles',
            subtitle: `Jusqu'à -${Math.min(50, Math.max(10, ...discounted.map(d => Math.round(((d.price - d.salePrice)/d.price)*100))))}% sur une sélection`,
            description: 'Profitez de réductions limitées sur des produits populaires.',
            products: discounted,
            badge: 'Promo',
            bgGradient: 'from-red-500 to-pink-600'
          })
        }
        if (newArrivals.length) {
          offersData.push({
            id: 'new',
            title: 'Nouvelles Arrivées',
            subtitle: `${newArrivals.length} nouveautés à découvrir`,
            description: 'Les derniers produits ajoutés à notre catalogue.',
            products: newArrivals,
            badge: 'Nouveau',
            bgGradient: 'from-blue-600 to-purple-600'
          })
        }
        setOffers(offersData)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('Impossible de charger les données')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [mapProduct])

  // Gestion du panier
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    
    // Notification (vous pouvez ajouter une toast notification ici)
    console.log('Produit ajouté au panier:', product.name)
  }

  // Gestion de la wishlist
  const handleToggleWishlist = (productId) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      }
      return [...prev, productId]
    })
  }

  const features = [
    {
      icon: ShoppingCartIcon,
      title: 'E-commerce Moderne',
      description: 'Une expérience d\'achat fluide et intuitive avec les dernières technologies'
    },
    {
      icon: HeartIcon,
      title: 'Produits de Qualité',
      description: 'Sélection rigoureuse de produits authentiques et de haute qualité'
    },
    {
      icon: UserIcon,
      title: 'Service Client',
      description: 'Support client réactif et personnalisé pour une expérience optimale'
    },
    {
      icon: CheckIcon,
      title: 'Livraison Rapide',
      description: 'Livraison sécurisée et rapide partout avec suivi en temps réel'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Clients Satisfaits' },
    { number: '500+', label: 'Produits' },
    { number: '50+', label: 'Marques Partenaires' },
    { number: '99%', label: 'Satisfaction Client' }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center bg-soni-orange/10 border border-soni-orange/20 rounded-full px-4 py-2">
                <span className="text-soni-orange text-sm font-medium">🚀 Nouveau sur SoniShop</span>
              </div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  L'avenir du
                  <span className="block bg-orange-400 bg-clip-text text-transparent">
                    e-commerce
                  </span>
                  commence ici
                </h1>
                <p className="text-xl text-blue-100 max-w-lg">
                  Découvrez une nouvelle façon de faire du shopping en ligne avec SoniShop. 
                  Moderne, rapide et sécurisé.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {!isAuthenticated ? (
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
                  >
                    Commencer maintenant
                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/products"
                    className="group inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
                  >
                    Parcourir les produits
                    <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white/10"
                >
                  En savoir plus
                </Link>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative">
              <div className="relative bg-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-soni-orange rounded-2xl">
                      <ShoppingCartIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">SoniShop</h3>
                      <p className="text-blue-100">Votre marketplace moderne</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-soni-orange/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-soni-navy mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir SoniShop ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous révolutionnons l'expérience e-commerce avec des fonctionnalités innovantes 
              et un service client exceptionnel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-soni-orange/20"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-700 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Section des catégories en vedette */}
  <FeaturedCategories categories={categories} loading={loading} error={error} />

      {/* Section des offres spéciales */}
      <SpecialOffers offers={offers} loading={loading} error={error} />

      {/* Section des produits en vedette */}
      <ProductSection
        title="Produits en Vedette"
        subtitle="Découvrez notre sélection des meilleurs produits tech du moment"
        products={featuredProducts}
        maxProducts={8}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        wishlist={wishlist}
      />

      {/* Section des témoignages */}
      <TestimonialCarousel />

      {/* CTA Section */}
      <section className="py-24 bg-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Prêt à commencer votre expérience SoniShop ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de clients satisfaits et découvrez une nouvelle façon de faire du shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated && (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-orange-500 hover:bg-orange-500/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
                >
                  Créer un compte gratuit
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white/10"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
