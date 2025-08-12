import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdvancedFilters from '../components/filters/AdvancedFilters'
import SearchBar from '../components/search/SearchBar'
import ProductGrid from '../components/products/ProductGrid'
import Pagination from '../components/pagination/Pagination'
import { useProductFilters } from '../hooks/useProductFilters'
import { usePagination } from '../hooks/usePagination'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)

  // Données simulées des produits avec données enrichies
  const mockProducts = [
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
      id: 4,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'smartphones',
      price: 785000,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
      description: 'Smartphone Android premium avec S Pen intégré et zoom 100x.',
      rating: 4.6,
      reviews: 203,
      inStock: false,
      isNew: false,
      freeShipping: true,
      sales: 567
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
      id: 8,
      name: 'Switch Gigabit 24 ports',
      category: 'electronics',
      price: 85000,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      description: 'Switch réseau 24 ports Gigabit pour entreprises.',
      rating: 4.3,
      reviews: 89,
      inStock: true,
      isNew: false,
      freeShipping: false,
      sales: 67
    },
    {
      id: 9,
      name: 'Caméra IP 4K Hikvision',
      category: 'electronics',
      price: 105000,
      salePrice: 95000,
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
      description: 'Caméra de surveillance IP 4K avec vision nocturne.',
      rating: 4.6,
      reviews: 432,
      inStock: true,
      isNew: false,
      freeShipping: false,
      sales: 189
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
      id: 11,
      name: 'Point d\'accès WiFi Ubiquiti',
      category: 'electronics',
      price: 155000,
      image: 'https://images.unsplash.com/photo-1606904825846-647eb8374a34?w=400',
      description: 'Point d\'accès WiFi professionnel pour couverture étendue.',
      rating: 4.7,
      reviews: 98,
      inStock: true,
      isNew: true,
      freeShipping: false,
      sales: 76
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

  // Initialisation du hook de filtrage
  const {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    getFilterStats
  } = useProductFilters(mockProducts, {
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
        products={mockProducts}
        onFiltersChange={handleFiltersChange}
        selectedCategory={filters.category}
        onCategoryChange={handleCategoryChange}
      />

      {/* Grille de produits */}
      <ProductGrid
        products={paginatedItems}
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
