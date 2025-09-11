import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../icons'

const gradients = [
  'from-blue-600 to-purple-600',
  'from-green-600 to-blue-600',
  'from-purple-600 to-pink-600',
  'from-orange-600 to-red-600',
  'from-indigo-600 to-cyan-600',
  'from-teal-600 to-emerald-600'
]

const FeaturedCategories = ({ categories = [], loading = false, error = null }) => {
  const enriched = categories.slice(0,8).map((c, idx) => ({
    ...c,
    gradient: gradients[idx % gradients.length],
    productCount: c.products_count ? `${c.products_count}+ produits` : undefined
  }))

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

        {/* Loading / Error */}
        {error && (
          <div className="text-center text-red-600 mb-6">{error}</div>
        )}
        {loading && !enriched.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length:4 }).map((_,i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        )}

        {/* Grille de catégories */}
        {!!enriched.length && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {enriched.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.slug || category.id}`}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform"
              >
                {/* Image de fond */}
                <div className="relative h-48 overflow-hidden">
                  {category.image_url || category.image ? (
                    <img
                      src={category.image_url || category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-sm">Aucune image</div>
                  )}
                  
                  {/* Overlay avec gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
                  
                  {/* Contenu sur l'image */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-xl font-bold mb-2 transform group-hover:translate-y-0 transition-transform duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-white/90 mb-2 transform group-hover:translate-y-0 transition-transform duration-300 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/80 font-medium">
                        {category.productCount || ''}
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
        )}

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
