import { useState, useEffect } from 'react'
import { productService } from '../api/productService'

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await productService.getProducts(filters)

      if (result.success) {
        setProducts(result.data.data || [])
        setPagination({
          currentPage: result.data.current_page,
          lastPage: result.data.last_page,
          total: result.data.total,
          perPage: result.data.per_page,
          from: result.data.from,
          to: result.data.to,
        })
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [JSON.stringify(filters)])

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts
  }
}

export const useCategories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)

      try {
        const { categoryService } = await import('../api/productService')
        const result = await categoryService.getCategories()

        if (result.success) {
          setCategories(result.data.data || [])
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Erreur lors du chargement des catégories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error
  }
}
