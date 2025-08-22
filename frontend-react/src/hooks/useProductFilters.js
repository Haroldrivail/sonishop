import { useState, useMemo } from 'react'


const slugify = (text) =>
  text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // remplace espaces par tirets
    .replace(/[^\w\-]+/g, '')       // enlève caractères spéciaux
    .replace(/\-\-+/g, '-')         // remplace plusieurs tirets par un seul
    .trim()

export const useProductFilters = (products, initialFilters = {}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all',
    sortBy: 'default',
    priceRange: [0, 2000000],
    brands: [],
    rating: 0,
    inStock: false,
    isNew: false,
    hasPromo: false,
    freeShipping: false,
    ...initialFilters
  })

  const categoriesSlug = [...new Set(products.map(p => p.categorySlug))];
  const categoriesNames = [...new Set(products.map(p => p.category))];


  // Trouver le nom de catégorie à partir du slug
  const getCategoryNameBySlug = (slug) => {
    const found = products.find(p => slugify(p.category) === slug.toLowerCase())
    return found ? found.category : ''
  }
  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filtrage par terme de recherche
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower)
      )
    }

    // Filtrage par catégorie
    if (filters.category && filters.category !== 'all') {
      result = result.filter(product =>
        slugify(product.category) === filters.category.toLowerCase()
      )
    }


    // Filtrage par gamme de prix
    if (filters.priceRange && filters.priceRange.length === 2) {
      const [minPrice, maxPrice] = filters.priceRange
      result = result.filter(product => {
        const price = product.salePrice || product.price
        return price >= minPrice && price <= maxPrice
      })
    }

    // Filtrage par marques
    if (filters.brands && filters.brands.length > 0) {
      result = result.filter(product => {
        const brand = product.name.split(' ')[0]
        return filters.brands.includes(brand)
      })
    }

    // Filtrage par note
    if (filters.rating > 0) {
      result = result.filter(product =>
        (product.rating || 0) >= filters.rating
      )
    }

    // Filtrage par disponibilité
    if (filters.inStock) {
      result = result.filter(product => product.inStock !== false)
    }

    // Filtrage par nouveautés
    if (filters.isNew) {
      result = result.filter(product => product.isNew === true)
    }

    // Filtrage par promotions
    if (filters.hasPromo) {
      result = result.filter(product => product.salePrice && product.salePrice < product.price)
    }

    // Filtrage par livraison gratuite
    if (filters.freeShipping) {
      result = result.filter(product => product.freeShipping === true)
    }

    // Tri
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price))
        break
      case 'price-desc':
        result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price))
        break
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        result.sort((a, b) => {
          if (a.isNew && !b.isNew) return -1
          if (!a.isNew && b.isNew) return 1
          return 0
        })
        break
      case 'popular':
        result.sort((a, b) => (b.sales || 0) - (a.sales || 0))
        break
      default:
        // Tri par défaut : promotions en premier, puis par popularité
        result.sort((a, b) => {
          const aHasPromo = a.salePrice && a.salePrice < a.price
          const bHasPromo = b.salePrice && b.salePrice < b.price

          if (aHasPromo && !bHasPromo) return -1
          if (!aHasPromo && bHasPromo) return 1

          return (b.sales || 0) - (a.sales || 0)
        })
    }

    return result
  }, [products, filters])

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      category: 'all',
      sortBy: 'default',
      priceRange: [0, 2000000],
      brands: [],
      rating: 0,
      inStock: false,
      isNew: false,
      hasPromo: false,
      freeShipping: false
    })
  }

  const getFilterStats = () => {
    const totalProducts = products.length
    const filteredCount = filteredProducts.length
    const brands = [...new Set(products.map(p => p.name.split(' ')[0]))]
    const prices = products.map(p => p.salePrice || p.price)
    const priceRange = {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    }

    return {
      totalProducts,
      filteredCount,
      categories: categoriesSlug.length,
      brands: brands.length,
      priceRange
    }
  }

  return {
    filters,
    filteredProducts,
    updateFilters,
    resetFilters,
    getFilterStats,
    getCategoryNameBySlug,  // utile pour afficher nom catégorie depuis slug

  }
}

export default useProductFilters
