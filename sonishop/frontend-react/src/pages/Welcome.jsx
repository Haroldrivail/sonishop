import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowRightIcon, ShoppingCartIcon, HeartIcon, UserIcon, CheckIcon } from '../components/icons/index'
import ProductSection from '../components/sections/ProductSection'
import FeaturedCategories from '../components/sections/FeaturedCategories'
import SpecialOffers from '../components/sections/SpecialOffers'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'

const Welcome = () => {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  // Récupérer message et produits via API
  useEffect(() => {
    axios.get('http://public.test/api/hello')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Erreur lors du chargement'))

    axios.get('http://public.test/api/products')
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false))
  }, [])

  // Statistiques (tu peux remplacer par un fetch si besoin)
  const stats = [
    { number: '10K+', label: 'Clients Satisfaits' },
    { number: '500+', label: 'Produits' },
    { number: '50+', label: 'Marques Partenaires' },
    { number: '99%', label: 'Satisfaction Client' }
  ]

  // Fonctionnalités (idem, à remplacer par fetch si besoin)
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

  // Gestion du panier
  const handleAddToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    console.log('Produit ajouté au panier:', product.name)
  }

  // Gestion wishlist
  const handleToggleWishlist = (productId) => {
    setWishlist(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId])
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-soni-navy via-soni-navy/95 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center bg-soni-orange/10 border border-soni-orange/20 rounded-full px-4 py-2">
                <span className="text-soni-orange text-sm font-medium">🚀 Nouveau sur SoniShop</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  L'avenir du{' '}
                  <span className="block bg-gradient-to-l from-soni-orange-100 to-orange-400 bg-clip-text text-transparent">
                    e-commerce
                  </span>{' '}
                  commence ici
                </h1>
                <p className="text-xl text-blue-100 max-w-lg">
                  {message || 'Chargement...'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/produits')}
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-soni-orange to-orange-500 hover:from-soni-orange/90 hover:to-orange-500/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
                >
                  Nos Produits
                  <ArrowRightIcon className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/20 hover:border-white/40 text-white font-semibold rounded-xl transition-all duration-200 hover:bg-white/10"
                >
                  Se connecter
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-tr from-soni-orange/20 to-blue-500/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="aspect-square bg-white/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-soni-orange rounded-2xl">
                      <ShoppingCartIcon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">SoniShop</h3>
                      <p className="text-blue-100">Votre marketplace moderne</p>
                    </div>
                  </div>
                </div>
              </div>
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
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-soni-navy mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
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
              Nous révolutionnons l'expérience e-commerce avec des fonctionnalités innovantes et un service client exceptionnel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-soni-orange/20"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-soni-navy to-blue-700 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <FeaturedCategories />

      {/* Special Offers */}
      <SpecialOffers />

      {/* Produits en Vedette */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-soni-navy mb-10">Produits populaires</h2>

        {loadingProducts ? (
          <p>Chargement des produits...</p>
        ) : products.length === 0 ? (
          <p>Aucun produit disponible pour le moment.</p>
        ) : (
          <ProductSection
            products={products}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-soni-orange py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-6">Rejoignez SoniShop aujourd'hui</h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg">
          Découvrez des produits exclusifs et profitez d'une expérience d'achat unique.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="inline-flex items-center justify-center px-12 py-4 bg-white text-soni-orange font-semibold rounded-xl hover:bg-gray-100 transition"
        >
          Créer un compte
          <ArrowRightIcon className="ml-3 w-5 h-5" />
        </button>
      </section>

      {/* Témoignages */}
      <TestimonialCarousel />
    </div>
  )
}

export default Welcome
