import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdvancedFilters from '../components/filters/AdvancedFilters'
import SearchBar from '../components/search/SearchBar'
import ProductGrid from '../components/products/ProductGrid'
import Pagination from '../components/pagination/Pagination'
import { useProductFilters } from '../hooks/useProductFilters'
import { usePagination } from '../hooks/usePagination'
import axios from '../axios'
import { transformProduct } from '../components/sections/ProductSection'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    axios.get('/products')
      .then(response => {
        console.log('Produits reçus :', response.data) // 👈 ajoute ceci

        const productsData = Array.isArray(response.data) ? response.data : (response.data.products || [])
        console.log('Type de data :', typeof response.data)
        console.log('Contenu brut :', response.data)
        // Transformation des produits pour normaliser les données
        const transformedProducts = productsData.map(transformProduct)

        setProducts(transformedProducts)
        console.log('Produits utilisés :', productsData)

        setLoading(false)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des produits:', error)
        setLoading(false)
      })
  }, [])

  // Initialisation du hook de filtrage
  const {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    getFilterStats
  } = useProductFilters(products, {
    category: searchParams.get('category') || 'all'
  })

  // Initialisation du hook de pagination
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    resetPagination
  } = usePagination(filteredProducts, 12)

  // Chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Gestion des filtres avancés
  const handleFiltersChange = useCallback((newFilters) => {
    updateFilters(newFilters)
    resetPagination() // Réinitialiser la pagination quand les filtres changent

    // Mettre à jour l'URL si nécessaire
    if (newFilters.category && newFilters.category !== 'all') {
      setSearchParams({ category: newFilters.category })
    } else {
      setSearchParams({})
    }
  }, [updateFilters, resetPagination, setSearchParams])

  // Gestion de la recherche
  const handleSearch = useCallback((searchTerm) => {
    updateFilters({ searchTerm })
    resetPagination() // Réinitialiser la pagination lors d'une recherche
  }, [updateFilters, resetPagination])

  // Gestion du tri
  const handleSortChange = useCallback((sortBy) => {
    updateFilters({ sortBy })
    resetPagination() // Réinitialiser la pagination lors d'un changement de tri
  }, [updateFilters, resetPagination])

  // Gestion du changement de catégorie
  const handleCategoryChange = useCallback((category) => {
    updateFilters({ category })
    resetPagination() // Réinitialiser la pagination lors d'un changement de catégorie
    if (category !== 'all') {
      setSearchParams({ category })
    } else {
      setSearchParams({})
    }
  }, [updateFilters, resetPagination, setSearchParams])

  const stats = getFilterStats()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soni-orange"></div>
      </div>
    )
  }

  const handleVote = async (productId, ratingValue) => {
  try {
    const response = await axios.post(`/products/${productId}/rate`, {
      rating: ratingValue
    })

    const updatedRating = response.data.rating

    // Met à jour la note localement
    setProducts(prev =>
      prev.map(product =>
        product.id === productId
          ? { ...product, rating: updatedRating }
          : product
      )
    )

    console.log("Note envoyée :", ratingValue)
  } catch (error) {
    console.error("Erreur lors de l'envoi du vote :", error)
  }
}


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche */}
      <SearchBar
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        sortBy={filters.sortBy}
        resultsCount={filteredProducts.length}
        totalCount={stats.totalProducts}
      />

      {/* Filtres avancés */}
      <AdvancedFilters
        products={products}
        onFiltersChange={handleFiltersChange}
        selectedCategory={filters.category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Grille de produits */}
      <ProductGrid
        products={paginatedItems}
        onVote={handleVote}

      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        showItemsInfo={true}
      />
    </div>
  )
}

export default Products
