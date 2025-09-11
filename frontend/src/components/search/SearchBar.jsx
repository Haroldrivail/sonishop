import React, { useState, useRef, useEffect } from 'react'
import { SearchIcon, XIcon, AdjustmentsIcon } from '../icons'

const SearchBar = ({
  onSearch,
  onSortChange,
  sortBy,
  resultsCount,
  totalCount,
  debounceDelay = 1000,
  searchValue = '',
  onResetAll,
  hasActiveFilters = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(searchValue)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  const sortOptions = [
    { value: 'default', label: 'Pertinence' },
    { value: 'price-asc', label: 'Prix croissant' },
    { value: 'price-desc', label: 'Prix décroissant' },
    { value: 'name-asc', label: 'Nom A-Z' },
    { value: 'name-desc', label: 'Nom Z-A' },
    { value: 'rating', label: 'Mieux notés' },
    { value: 'newest', label: 'Nouveautés' },
    { value: 'popular', label: 'Populaires' }
  ]

  const searchSuggestions = [
    'iPhone', 'Samsung', 'MacBook', 'iPad', 'AirPods',
    'Ordinateur portable', 'Smartphone', 'Tablette',
    'Casque audio', 'Router', 'Switch', 'Camera'
  ]

  const triggerSearch = (value) => {
    onSearch && onSearch(value)
  }

  const handleSearchChange = (value) => {
    setSearchTerm(value)
    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      triggerSearch(value)
    }, debounceDelay)
  }

  const handleSuggestionClick = (suggestion) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchTerm(suggestion)
    triggerSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearchTerm('')
    triggerSearch('')
    searchRef.current?.focus()
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync external search value -> internal state
  useEffect(() => {
    setSearchTerm(searchValue)
  }, [searchValue])

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="relative flex items-center gap-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && searchTerm) {
                    clearSearch()
                  } else if (e.key === 'Enter') {
                    // Enter: déclenche immédiat sans attendre le debounce
                    if (debounceRef.current) clearTimeout(debounceRef.current)
                    triggerSearch(searchTerm)
                  }
                }}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none transition-all"
              />
              <button
                onClick={clearSearch}
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
                disabled={!searchTerm}
                className={`relative z-10 -ml-1 px-3 py-2 rounded-lg border text-sm flex items-center gap-1 transition-colors ${searchTerm ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
              >
                <XIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Effacer</span>
              </button>
            </div>

            {/* Suggestions de recherche */}
            {showSuggestions && searchTerm.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700">Suggestions populaires</p>
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                  >
                    <SearchIcon className="inline w-4 h-4 mr-2 text-gray-400" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tri et résultats */}
          <div className="flex items-center gap-4">
            {/* Compteur de résultats */}
            <div className="text-sm text-gray-600 whitespace-nowrap">
              {resultsCount === totalCount ? (
                <span>{totalCount} produits</span>
              ) : (
                <span>
                  <span className="font-medium text-soni-navy">{resultsCount}</span> sur {totalCount} produits
                </span>
              )}
            </div>

            {/* Tri */}
            <div className="flex items-center gap-2">
              <AdjustmentsIcon className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none bg-white min-w-[140px]"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset global */}
            <div>
              <button
                onClick={() => { onResetAll && onResetAll(); clearSearch(); }}
                disabled={!hasActiveFilters}
                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${hasActiveFilters ? 'border-gray-300 text-gray-600 hover:bg-gray-50' : 'border-gray-200 text-gray-300 cursor-not-allowed'}`}
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Barre de résultats avec terme de recherche */}
        {searchTerm && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Résultats pour <span className="font-medium text-gray-900">"{searchTerm}"</span>
              </p>
              {resultsCount === 0 && (
                <p className="text-sm text-gray-500">
                  Aucun produit trouvé. Essayez d'autres mots-clés.
                </p>
              )}
              <button
                onClick={clearSearch}
                className="ml-4 text-xs font-medium text-soni-orange hover:text-soni-orange/80 transition-colors"
                disabled={!searchTerm}
              >Effacer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar
