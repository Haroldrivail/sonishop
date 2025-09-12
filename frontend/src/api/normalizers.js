// Fonctions de normalisation des réponses API
// Centralise la transformation pour réutilisation cohérente entre pages

export const normalizeProduct = (raw) => {
  if (!raw || typeof raw !== 'object') return {}
  const stock = Number(raw.stock ?? raw.quantity ?? raw.available_stock ?? raw.inventory ?? 0)
  const category = typeof raw.category === 'object'
    ? (raw.category?.slug || raw.category?.name || raw.category?.title || raw.category_id || '')
    : (raw.category || raw.category_id || '')

  return {
    id: raw.id,
    name: raw.name || raw.title || '',
    category,
    price: Number(raw.price ?? raw.amount ?? 0),
    salePrice: raw.sale_price ?? raw.promo_price ?? null,
    image: raw.image_url || raw.image || raw.thumbnail || raw.cover || '/placeholder-product.png',
    description: raw.description || raw.short_description || '',
    rating: raw.rating ?? raw.average_rating ?? 0,
    reviews: raw.reviews_count ?? raw.reviews?.length ?? 0,
    inStock: raw.in_stock ?? stock > 0,
    stock,
    isNew: raw.is_new ?? false,
    freeShipping: raw.free_shipping ?? false,
    sales: raw.sales ?? raw.total_sales ?? 0,
    status: raw.status || (stock <= 0 ? 'out_of_stock' : (stock < 5 ? 'low_stock' : 'active'))
  }
}

export const extractCollection = (root) => {
  if (Array.isArray(root)) return root
  if (Array.isArray(root?.data)) return root.data
  if (Array.isArray(root?.data?.data)) return root.data.data // Certains wrappers { data: { data: [...] }}
  return []
}

export const extractPagination = (root, fallbackCount) => {
  if (Array.isArray(root)) {
    return {
      current_page: 1,
      last_page: 1,
      total: root.length,
      per_page: root.length,
      from: 1,
      to: root.length
    }
  }
  const source = root.meta || root.pagination || root
  return {
    current_page: source.current_page ?? 1,
    last_page: source.last_page ?? 1,
    total: source.total ?? fallbackCount ?? 0,
    per_page: source.per_page ?? fallbackCount ?? 0,
    from: source.from ?? 1,
    to: source.to ?? fallbackCount ?? fallbackCount
  }
}

export const normalizeProductsResponse = (responseData) => {
  const collection = extractCollection(responseData)
  const items = collection.map(normalizeProduct)
  const pagination = extractPagination(responseData, items.length)
  return { items, pagination }
}
