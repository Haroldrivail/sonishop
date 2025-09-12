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
        // Supporte plusieurs formes: {status:'ok', data:{ data:[...] }} ou { data:[...] }
        const root = result.data
        const collection = Array.isArray(root)
          ? root
          : (Array.isArray(root.data) ? root.data : (Array.isArray(root.data?.data) ? root.data.data : []))

        // Normalisation produits minimale (assure image disponible)
        const normalized = collection.map(p => ({
          ...p,
          image: p.image_url || p.image || '/placeholder-product.png'
        }))

        setProducts(normalized)

        const metaSource = Array.isArray(root) ? null : (
          root.meta || root // laravel paginator expose meta directement sur l'objet retourné ici
        )

        if (metaSource && (metaSource.current_page || root.current_page)) {
          const m = metaSource
          setPagination({
            currentPage: m.current_page ?? root.current_page,
            lastPage: m.last_page ?? root.last_page,
            total: m.total ?? root.total ?? normalized.length,
            perPage: m.per_page ?? root.per_page ?? normalized.length,
            from: m.from ?? root.from ?? 1,
            to: m.to ?? root.to ?? normalized.length,
          })
        } else {
          setPagination({
            currentPage: 1,
            lastPage: 1,
            total: normalized.length,
            perPage: normalized.length,
            from: 1,
            to: normalized.length,
          })
        }
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
