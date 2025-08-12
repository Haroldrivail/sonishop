import React, { useState, useRef, useEffect } from 'react'
import { SearchIcon, XIcon, AdjustmentsIcon } from '../icons'

const SearchBar = ({ onSearch, onSortChange, sortBy, resultsCount, totalCount }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef(null)

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

  const handleSearch = (value) => {
    setSearchTerm(value)
    onSearch(value)
  }

  const handleSuggestionClick = (suggestion) => {
    handleSearch(suggestion)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    handleSearch('')
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

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          
          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none transition-all"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
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
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchBar
