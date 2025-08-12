import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons'

const Categories = () => {
  const categories = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      description: 'Les derniers modèles de téléphones intelligents',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500',
      productCount: 25,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'laptops',
      name: 'Ordinateurs portables',
      description: 'Performants et polyvalents pour tous vos besoins',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
      productCount: 18,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'tablets',
      name: 'Tablettes',
      description: 'Parfaites pour le travail et le divertissement',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
      productCount: 12,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Casques, écouteurs et systèmes audio premium',
      image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=500',
      productCount: 32,
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'watches',
      name: 'Montres connectées',
      description: 'Suivez votre forme et restez connecté',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      productCount: 15,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'accessories',
      name: 'Accessoires',
      description: 'Coques, chargeurs et autres accessoires',
      image: 'https://images.unsplash.com/photo-1609205807107-e3b433c49e11?w=500',
      productCount: 45,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      id: 'electronics',
      name: 'Électronique & Réseaux',
      description: 'Équipements réseau, serveurs et systèmes de sécurité',
      image: 'https://images.unsplash.com/photo-1558618047-3c0c8c5c8d3e?w=500',
      productCount: 28,
      color: 'from-teal-500 to-teal-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-soni-navy to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Nos Catégories
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explorez notre large gamme de produits technologiques organisés par catégories
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(category => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Category Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-sm font-semibold text-gray-800">
                      {category.productCount} produits
                    </span>
                  </div>

                  {/* Category Title Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Category Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-soni-navy transition-colors">
                        Explorer {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Découvrir tous les produits
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-soni-navy to-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <ArrowRightIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Catégories populaires
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les catégories les plus recherchées par nos clients
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 4).map(category => (
              <Link
                key={`popular-${category.id}`}
                to={`/products?category=${category.id}`}
                className="group text-center p-6 rounded-xl bg-gray-50 hover:bg-gradient-to-br hover:from-soni-navy/5 hover:to-blue-600/5 transition-all duration-300"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-soni-navy to-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white font-bold text-xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-soni-navy transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.productCount} produits
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-soni-orange to-orange-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Contactez-nous et nous vous aiderons à trouver le produit parfait pour vos besoins
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 bg-white text-soni-orange rounded-lg hover:bg-gray-50 transition-colors font-semibold shadow-lg"
            >
              Nous contacter
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-100 transition-colors font-semibold"
            >
              Voir tous les produits
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Categories
