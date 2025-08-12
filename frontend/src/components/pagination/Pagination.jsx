import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showItemsInfo = true 
}) => {
  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  if (totalPages <= 1) return null

  return (
    <div className="bg-white px-4 py-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Informations sur les éléments */}
        {showItemsInfo && (
          <div className="text-sm text-gray-700">
            Affichage de <span className="font-medium">{startItem}</span> à{' '}
            <span className="font-medium">{endItem}</span> sur{' '}
            <span className="font-medium">{totalItems}</span> produits
          </div>
        )}

        {/* Navigation de pagination */}
        <nav className="flex items-center gap-2" aria-label="Pagination">
          
          {/* Bouton Précédent */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Précédent</span>
          </button>

          {/* Numéros de page */}
          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="px-3 py-2 text-sm text-gray-500"
                  >
                    ...
                  </span>
                )
              }

              const isCurrentPage = page === currentPage

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isCurrentPage
                      ? 'bg-soni-orange text-white border border-soni-orange shadow-sm'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                  aria-current={isCurrentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )
            })}
          </div>

          {/* Bouton Suivant */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </nav>
      </div>

      {/* Sélecteur d'éléments par page (optionnel) */}
      <div className="mt-4 flex items-center justify-center sm:justify-end">
        <label htmlFor="items-per-page" className="text-sm text-gray-700 mr-2">
          Produits par page :
        </label>
        <select
          id="items-per-page"
          value={itemsPerPage}
          onChange={(e) => {
            const newItemsPerPage = parseInt(e.target.value)
            const newTotalPages = Math.ceil(totalItems / newItemsPerPage)
            const newCurrentPage = Math.min(currentPage, newTotalPages)
            onPageChange(newCurrentPage, newItemsPerPage)
          }}
          className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-soni-orange focus:border-soni-orange outline-none"
        >
          <option value={8}>8</option>
          <option value={12}>12</option>
          <option value={16}>16</option>
          <option value={24}>24</option>
        </select>
      </div>
    </div>
  )
}

export default Pagination
