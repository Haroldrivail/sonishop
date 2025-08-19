import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../icons'

const FeaturedCategories = () => {
  const categories = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      description: 'Les derniers modèles des plus grandes marques',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
      gradient: 'from-blue-600 to-purple-600',
      productCount: '15+ produits'
    },
    {
      id: 'laptops',
      name: 'Ordinateurs',
      description: 'Laptops et ordinateurs pour tous les besoins',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
      gradient: 'from-green-600 to-blue-600',
      productCount: '20+ produits'
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Écouteurs, casques et enceintes premium',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500',
      gradient: 'from-purple-600 to-pink-600',
      productCount: '12+ produits'
    },
    {
      id: 'electronics',
      name: 'Électronique & Réseaux',
      description: 'Équipements professionnels et solutions réseaux',
      image: 'https://images.unsplash.com/photo-1558618047-3c0c8c5c8d3e?w=500',
      gradient: 'from-orange-600 to-red-600',
      productCount: '25+ produits'
    }
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Nos Catégories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explorez notre gamme complète de produits tech organisés par catégories
          </p>
        </div>

        {/* Grille de catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform"
            >
              {/* Image de fond */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay avec gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
                
                {/* Contenu sur l'image */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-xl font-bold mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/90 mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/80 font-medium">
                      {category.productCount}
                    </span>
                    <ArrowRightIcon className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>

              {/* Bande inférieure */}
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Explorer la catégorie</span>
                  <ArrowRightIcon className="w-4 h-4 text-soni-orange transform group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Statistiques */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-soni-navy mb-2">100+</div>
            <div className="text-gray-600">Produits disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-soni-orange mb-2">50+</div>
            <div className="text-gray-600">Marques partenaires</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
            <div className="text-gray-600">Livraison express</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCategories
