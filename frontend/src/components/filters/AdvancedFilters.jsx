import React, { useState, useEffect } from 'react'
import { 
  ChevronDownIcon, 
  XIcon, 
  CheckIcon,
  SearchIcon,
  ArrowsRightLeftIcon,
  TruckIcon
} from '../icons'

const AdvancedFilters = ({ 
  products, 
  onFiltersChange, 
  selectedCategory, 
  onCategoryChange 
}) => {
  const [filters, setFilters] = useState({
    category: selectedCategory || 'all',
    priceRange: [0, 2000000],
    brands: [],
    rating: 0,
    inStock: false,
    isNew: false,
    hasPromo: false,
    freeShipping: false
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Données pour les filtres
  const categories = [
    { value: 'all', label: 'Tous les produits', count: products.length },
    { value: 'smartphones', label: 'Smartphones', count: products.filter(p => p.category === 'smartphones').length },
    { value: 'laptops', label: 'Ordinateurs', count: products.filter(p => p.category === 'laptops').length },
    { value: 'tablets', label: 'Tablettes', count: products.filter(p => p.category === 'tablets').length },
    { value: 'audio', label: 'Audio', count: products.filter(p => p.category === 'audio').length },
    { value: 'electronics', label: 'Électronique & Réseaux', count: products.filter(p => p.category === 'electronics').length }
  ]

  const brands = [...new Set(products.map(p => p.name.split(' ')[0]))].map(brand => ({
    value: brand,
    label: brand,
    count: products.filter(p => p.name.startsWith(brand)).length
  }))

  const priceRanges = [
    { label: 'Moins de 100 000 FCFA', min: 0, max: 100000 },
    { label: '100 000 - 300 000 FCFA', min: 100000, max: 300000 },
    { label: '300 000 - 500 000 FCFA', min: 300000, max: 500000 },
    { label: '500 000 - 1 000 000 FCFA', min: 500000, max: 1000000 },
    { label: 'Plus de 1 000 000 FCFA', min: 1000000, max: 2000000 }
  ]

  const ratings = [
    { value: 4.5, label: '4.5+ étoiles' },
    { value: 4, label: '4+ étoiles' },
    { value: 3.5, label: '3.5+ étoiles' },
    { value: 3, label: '3+ étoiles' }
  ]

  useEffect(() => {
    setFilters(prev => ({ ...prev, category: selectedCategory || 'all' }))
  }, [selectedCategory])

  useEffect(() => {
    // Compter les filtres actifs
    let count = 0
    if (filters.category !== 'all') count++
    if (filters.brands.length > 0) count++
    if (filters.rating > 0) count++
    if (filters.inStock) count++
    if (filters.isNew) count++
    if (filters.hasPromo) count++
    if (filters.freeShipping) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 2000000) count++
    
    setActiveFiltersCount(count)
  }, [filters])

  // Effet séparé pour appliquer les filtres
  useEffect(() => {
    onFiltersChange(filters)
  }, [filters]) // Retirer onFiltersChange des dépendances

  const handleCategoryChange = (category) => {
    setFilters(prev => ({ ...prev, category }))
    onCategoryChange(category)
  }

  const handleBrandToggle = (brand) => {
    setFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }))
  }

  const handlePriceRangeSelect = (min, max) => {
    setFilters(prev => ({ ...prev, priceRange: [min, max] }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      priceRange: [0, 2000000],
      brands: [],
      rating: 0,
      inStock: false,
      isNew: false,
      hasPromo: false,
      freeShipping: false
    })
    onCategoryChange('all')
  }

  const clearFilter = (filterType, value = null) => {
    switch (filterType) {
      case 'category':
        handleCategoryChange('all')
        break
      case 'brand':
        setFilters(prev => ({
          ...prev,
          brands: prev.brands.filter(b => b !== value)
        }))
        break
      case 'priceRange':
        setFilters(prev => ({ ...prev, priceRange: [0, 2000000] }))
        break
      case 'rating':
        setFilters(prev => ({ ...prev, rating: 0 }))
        break
      default:
        setFilters(prev => ({ ...prev, [filterType]: false }))
    }
  }

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header avec bouton toggle */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-soni-navy transition-colors font-medium"
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
              Filtres avancés
              {activeFiltersCount > 0 && (
                <span className="bg-soni-orange text-white text-xs rounded-full px-2 py-1 ml-1">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Effacer tous les filtres
              </button>
            )}
          </div>

          {/* Filtres actifs affichés */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filters.category !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-soni-navy/10 text-soni-navy rounded-full text-sm">
                  {categories.find(c => c.value === filters.category)?.label}
                  <button onClick={() => clearFilter('category')}>
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.brands.map(brand => (
                <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {brand}
                  <button onClick={() => clearFilter('brand', brand)}>
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {filters.rating > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {filters.rating}+ étoiles
                  <button onClick={() => clearFilter('rating')}>
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              )}

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 2000000) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Prix: {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()} FCFA
                  <button onClick={() => clearFilter('priceRange')}>
                    <XIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Panneau de filtres expandable */}
        {isExpanded && (
          <div className="pb-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Catégories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Catégories</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
                    <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.value}
                        checked={filters.category === category.value}
                        onChange={() => handleCategoryChange(category.value)}
                        className="text-soni-orange focus:ring-soni-orange"
                      />
                      <span className="text-sm text-gray-700 flex-1">{category.label}</span>
                      <span className="text-xs text-gray-500">({category.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Marques */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Marques</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand.value)}
                        onChange={() => handleBrandToggle(brand.value)}
                        className="text-soni-orange focus:ring-soni-orange"
                      />
                      <span className="text-sm text-gray-700 flex-1">{brand.label}</span>
                      <span className="text-xs text-gray-500">({brand.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Prix</h3>
                <div className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <label key={index} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={filters.priceRange[0] === range.min && filters.priceRange[1] === range.max}
                        onChange={() => handlePriceRangeSelect(range.min, range.max)}
                        className="text-soni-orange focus:ring-soni-orange"
                      />
                      <span className="text-sm text-gray-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options supplémentaires */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
                <div className="space-y-3">
                  
                  {/* Note */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note minimum
                    </label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none text-sm"
                    >
                      <option value={0}>Toutes les notes</option>
                      {ratings.map(rating => (
                        <option key={rating.value} value={rating.value}>
                          {rating.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Disponibilité */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="text-soni-orange focus:ring-soni-orange"
                    />
                    <span className="text-sm text-gray-700">En stock uniquement</span>
                  </label>

                  {/* Nouveautés */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.isNew}
                      onChange={(e) => setFilters(prev => ({ ...prev, isNew: e.target.checked }))}
                      className="text-soni-orange focus:ring-soni-orange"
                    />
                    <span className="text-sm text-gray-700">Nouveautés</span>
                  </label>

                  {/* Promotions */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasPromo}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasPromo: e.target.checked }))}
                      className="text-soni-orange focus:ring-soni-orange"
                    />
                    <span className="text-sm text-gray-700">En promotion</span>
                  </label>

                  {/* Livraison gratuite */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.freeShipping}
                      onChange={(e) => setFilters(prev => ({ ...prev, freeShipping: e.target.checked }))}
                      className="text-soni-orange focus:ring-soni-orange"
                    />
                    <TruckIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Livraison gratuite</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedFilters
