import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon, ShoppingCartIcon, HeartIcon, UserIcon, CheckIcon } from '../components/icons'
import ProductSection from '../components/sections/ProductSection'
import FeaturedCategories from '../components/sections/FeaturedCategories'
import SpecialOffers from '../components/sections/SpecialOffers'
import TestimonialCarousel from '../components/sections/TestimonialCarousel'
import { useAuth } from '../context/AuthContext'  // importe ton hook d'auth

const Home = () => {
   const { isAuthenticated } = useAuth(); // récupère l'état d'authentification
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])

  // Données des produits en vedette (sélection des meilleurs produits)
  const featuredProducts = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      category: 'smartphones',
      price: 915000,
      salePrice: 850000,
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      description: 'Le smartphone le plus avancé d\'Apple avec puce A17 Pro et caméra révolutionnaire.',
      rating: 4.8,
      reviews: 324,
      inStock: true,
      isNew: true,
      freeShipping: true,
      sales: 1250
    },
    {
      id: 2,
      name: 'MacBook Pro 16"',
      category: 'laptops',
      price: 1635000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      description: 'Ordinateur portable professionnel avec puce M3 Pro pour les créatifs.',
      rating: 4.9,
      reviews: 156,
      inStock: true,
      isNew: false,
      freeShipping: true,
      sales: 890
    },
    {
      id: 3,
      name: 'AirPods Pro 2',
      category: 'audio',
      price: 182000,
      salePrice: 163000,
      image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=400',
      description: 'Écouteurs sans fil avec annulation de bruit adaptive et son spatial.',
      rating: 4.7,
      reviews: 892,
      inStock: true,
      isNew: true,
      freeShipping: false,
      sales: 2340
    },
    {
      id: 5,
      name: 'iPad Pro 12.9"',
      category: 'tablets',
      price: 785000,
      salePrice: 720000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
      description: 'Tablette pro avec écran Liquid Retina XDR et puce M2.',
      rating: 4.8,
      reviews: 445,
      inStock: true,
      isNew: false,
      freeShipping: true,
      sales: 445
    },
    {
      id: 6,
      name: 'Sony WH-1000XM5',
      category: 'audio',
      price: 261000,
      salePrice: 248000,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
      description: 'Casque sans fil avec réduction de bruit leader du marché.',
      rating: 4.7,
      reviews: 678,
      inStock: true,
      isNew: false,
      freeShipping: false,
      sales: 1123
    },
    {
      id: 7,
      name: 'Router WiFi 6 TP-Link Archer AX73',
      category: 'electronics',
      price: 140000,
      salePrice: 125000,
      image: 'https://images.unsplash.com/photo-1606904825846-647eb8374a34?w=400',
      description: 'Routeur WiFi 6 haute performance pour maison connectée.',
      rating: 4.5,
      reviews: 256,
      inStock: true,
      isNew: true,
      freeShipping: false,
      sales: 234
    },
    {
      id: 10,
      name: 'Onduleur APC 1500VA',
      category: 'electronics',
      price: 195000,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      description: 'Onduleur professionnel pour protection électrique.',
      rating: 4.8,
      reviews: 167,
      inStock: true,
      isNew: false,
      freeShipping: true,
      sales: 123
    },
    {
      id: 12,
      name: 'Dell XPS 13',
      category: 'laptops',
      price: 1200000,
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
      description: 'Ultrabook compact et puissant pour professionnels.',
      rating: 4.5,
      reviews: 267,
      inStock: true,
      isNew: false,
      freeShipping: true,
      sales: 345
    }
  ]

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
      <section className="relative bg-gradient-to-br from-soni-navy via-soni-navy/95 to-blue-900 text-white overflow-hidden">
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
                  <span className="block bg-gradient-to-l from-soni-orange-100 to-orange-400 bg-clip-text text-transparent">
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
                 {!isAuthenticated && (
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-soni-orange to-orange-500 hover:from-soni-orange/90 hover:to-orange-500/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
                >
                  Commencer maintenant
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
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-soni-navy to-blue-700 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
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
      <FeaturedCategories />

      {/* Section des offres spéciales */}
      <SpecialOffers />

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
      <section className="py-24 bg-gradient-to-r from-soni-navy to-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Prêt à commencer votre expérience SoniShop ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de clients satisfaits et découvrez une nouvelle façon de faire du shopping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-soni-orange to-orange-500 hover:from-soni-orange/90 hover:to-orange-500/90 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform"
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
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
