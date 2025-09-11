import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../components/icons'
import { api } from '../api/client'

// Palette de dégradés réutilisable si l'API ne fournit pas de couleur
const gradientPool = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-green-500 to-green-600',
  'from-orange-500 to-orange-600',
  'from-red-500 to-red-600',
  'from-indigo-500 to-indigo-600',
  'from-teal-500 to-teal-600'
]

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const res = await api.categories.getAll()
        const apiData = res.data?.data || []
        // Map backend -> UI (ajout d'un dégradé et d'un compteur placeholder si absent)
        const mapped = apiData.map((c, idx) => ({
          id: c.slug || c.id,
          slug: c.slug,
          name: c.name,
          description: c.description || '',
          image: c.image_url || c.image || `https://source.unsplash.com/random/800x600?tech,${c.slug}`,
          productCount: c.products_count ?? c.products?.length ?? 0,
          color: gradientPool[idx % gradientPool.length]
        }))
        if (isMounted) setCategories(mapped)
      } catch (e) {
        console.error('Erreur chargement catégories', e)
        if (isMounted) setError("Impossible de charger les catégories.")
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchCategories()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">Chargement des catégories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow rounded-lg p-8 max-w-md text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-soni-navy text-white rounded hover:bg-soni-navy/90"
          >Réessayer</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-blue-800 text-white py-16">
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
                    <h3 className="text-xl font-bold text-white mb-2">
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
                    <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
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

          {/* Fetch popular categories from the API (fallback to getAll and pick top 4) */}
          {(() => {
            const Popular = () => {
              const [popular, setPopular] = useState([])
              const [loadingPop, setLoadingPop] = useState(true)

              useEffect(() => {
                let mounted = true
                const fetchPopular = async () => {
                  setLoadingPop(true)
                  try {
                    let res
                    if (api.categories.getPopular) {
                      // preferred endpoint if available
                      res = await api.categories.getPopular()
                    } else {
                      // fallback to all categories and pick top by product count
                      res = await api.categories.getAll()
                    }
                    const apiData = res?.data?.data || []
                    let items = apiData

                    if (!api.categories.getPopular) {
                      // sort copy by products_count (or products length) and take top 4
                      items = [...apiData].sort(
                        (a, b) =>
                          (b.products_count ?? b.products?.length ?? 0) -
                          (a.products_count ?? a.products?.length ?? 0)
                      ).slice(0, 4)
                    } else {
                      // ensure we only render up to 4 if API returns more
                      items = apiData.slice(0, 4)
                    }

                    if (mounted) setPopular(items)
                  } catch (e) {
                    console.error('Erreur chargement catégories populaires', e)
                  } finally {
                    if (mounted) setLoadingPop(false)
                  }
                }

                fetchPopular()
                return () => { mounted = false }
              }, [])

              if (loadingPop) {
                return (
                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des catégories populaires...</p>
                  </div>
                )
              }

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {popular.map(category => {
                    const id = category.slug || category.id
                    const count = category.products_count ?? category.products?.length ?? 0
                    return (
                      <Link
                        key={`popular-${id}`}
                        to={`/products?category=${id}`}
                        className="group text-center p-6 rounded-xl bg-gray-50 hover:bg-gradient-to-br hover:from-soni-navy/5 hover:to-blue-600/5 transition-all duration-300"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white font-bold text-xl">
                            {(category.name || '').charAt(0)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-soni-navy transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {count} produits
                        </p>
                      </Link>
                    )
                  })}
                </div>
              )
            }

            return <Popular />
          })()}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 py-16">
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
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-950 transition-colors font-semibold"
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
