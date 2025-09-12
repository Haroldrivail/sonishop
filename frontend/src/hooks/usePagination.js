import { useState, useMemo } from 'react'

export const usePagination = (items, initialItemsPerPage = 12) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const handlePageChange = (page, newItemsPerPage = null) => {
    if (newItemsPerPage && newItemsPerPage !== itemsPerPage) {
      setItemsPerPage(newItemsPerPage)
      // Recalculer la page en fonction du nouvel itemsPerPage
      const newTotalPages = Math.ceil(totalItems / newItemsPerPage)
      const newPage = Math.min(page, newTotalPages)
      setCurrentPage(newPage)
    } else {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }
  }

  const goToFirstPage = () => setCurrentPage(1)
  const goToLastPage = () => setCurrentPage(totalPages)
  const goToNextPage = () => setCurrentPage(Math.min(currentPage + 1, totalPages))
  const goToPreviousPage = () => setCurrentPage(Math.max(currentPage - 1, 1))

  const resetPagination = () => {
    setCurrentPage(1)
  }

  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedItems,
    handlePageChange,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    resetPagination,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }
}

export default usePagination
