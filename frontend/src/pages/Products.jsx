import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdvancedFilters from '../components/filters/AdvancedFilters'
import SearchBar from '../components/search/SearchBar'
import ProductGrid from '../components/products/ProductGrid'
import Pagination from '../components/pagination/Pagination'
import { productService } from '../api/productService'

// NOTE: Ancienne logique de filtrage/pagination client remplacée par pagination & filtrage serveur.

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [totalProducts, setTotalProducts] = useState(0)
  const [paginationMeta, setPaginationMeta] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // Filtre minimal centralisé (le hook précédent filtrant côté client a été supprimé pour éviter les incohérences)
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: searchParams.get('category') || 'all',
    sortBy: 'default'
  })

  // Fallback minimal en cas d'échec complet (limité pour ne plus dépendre de données hardcodées étendues)
  const minimalFallback = []

  const updateFilters = (partial) => setFilters(prev => ({ ...prev, ...partial }))
  const resetPagination = () => setCurrentPage(1)
  const handlePageChange = (page, newItemsPerPage = null) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage)
      // recalculer page valide selon last_page éventuel
      const lastPage = paginationMeta?.last_page || Math.ceil(totalProducts / newItemsPerPage) || 1
      const safePage = Math.min(page, lastPage)
      setCurrentPage(safePage < 1 ? 1 : safePage)
    } else {
      setCurrentPage(page < 1 ? 1 : page)
    }
  }

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

  // Charger les produits depuis l'API via service centralisé
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        let sort_by, sort_direction
        switch (filters.sortBy) {
          case 'price-asc': sort_by = 'price'; sort_direction = 'asc'; break
          case 'price-desc': sort_by = 'price'; sort_direction = 'desc'; break
          case 'name-asc': sort_by = 'name'; sort_direction = 'asc'; break
          case 'name-desc': sort_by = 'name'; sort_direction = 'desc'; break
          case 'rating': sort_by = 'rating'; sort_direction = 'desc'; break
          case 'newest': sort_by = 'created_at'; sort_direction = 'desc'; break
          case 'popular': sort_by = 'sales'; sort_direction = 'desc'; break
          default: break
        }

        const result = await productService.getProducts({
          page: currentPage,
            per_page: itemsPerPage,
            sort_by, sort_direction,
            q: filters.searchTerm || undefined,
            category: filters.category !== 'all' ? filters.category : undefined,
        })

        if (result.success) {
          const { items, pagination } = result.data
          setProducts(items)
          setPaginationMeta({
            total: pagination.total,
            last_page: pagination.last_page,
            current_page: pagination.current_page,
            per_page: pagination.per_page,
          })
          setTotalProducts(pagination.total)
        } else {
          setError(result.error)
          setProducts(minimalFallback)
        }
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err)
        setError('Impossible de charger les produits. Veuillez réessayer plus tard.')
        setProducts(minimalFallback)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [currentPage, itemsPerPage, filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-soni-orange"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de recherche */}
      <SearchBar
        onSearch={handleSearch}
        onSortChange={handleSortChange}
        sortBy={filters.sortBy}
        resultsCount={products.length}
        totalCount={paginationMeta?.total ?? totalProducts ?? products.length}
        searchValue={filters.searchTerm}
        onResetAll={() => {
          setFilters({ searchTerm: '', category: 'all', sortBy: 'default' })
          setSearchParams({})
          setCurrentPage(1)
        }}
        hasActiveFilters={
          !!filters.searchTerm || (filters.category && filters.category !== 'all') || filters.sortBy !== 'default'
        }
      />

      {/* Filtres avancés */}
      <AdvancedFilters
        products={products}
        onFiltersChange={handleFiltersChange}
        selectedCategory={filters.category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Grille de produits */}
      <ProductGrid products={products} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={paginationMeta?.last_page || Math.ceil(totalProducts / itemsPerPage) || 1}
        totalItems={paginationMeta?.total || totalProducts}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        showItemsInfo={true}
      />
    </div>
  )
}

export default Products
