import React, { useState, useEffect, useCallback, useMemo } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import {
    ShoppingBagIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    PhotoIcon,
    StarIcon,
    ChevronUpIcon,
    ChevronDownIcon
} from '../../components/icons'

import { productService, categoryService } from '../../api/productService'
import { api } from '../../api/client'
import ENDPOINTS, { ENDPOINTS as E } from '../../api/endpoints'

const ProductsManagement = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const [total, setTotal] = useState(0)
    const [categoriesList, setCategoriesList] = useState([])

    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [showFormModal, setShowFormModal] = useState(false)
    const [formMode, setFormMode] = useState('create') // create | edit | view
    const [formData, setFormData] = useState({ name:'', category:'', price:'', stock:'', status:'active', description:'', image:'' })
    const [saving, setSaving] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showCategoriesManager, setShowCategoriesManager] = useState(false)
    const [categoryForm, setCategoryForm] = useState({ name:'', description:'' })
    const [savingCategory, setSavingCategory] = useState(false)
    const [categoryEdits, setCategoryEdits] = useState({}) // id -> { name, description, saving }
    // Debounce local sans hook externe pour éviter fichier supplémentaire
    const [debouncedSearch, setDebouncedSearch] = useState('')
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 400)
        return () => clearTimeout(t)
    }, [searchTerm])

    const categories = useMemo(() => ['all', ...categoriesList.map(c => c.name || c.title || c.slug)].filter((v,i,a)=> a.indexOf(v)===i), [categoriesList])
    const statuses = ['all', 'active', 'out_of_stock', 'low_stock', 'inactive']

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = {
                page,
                per_page: perPage,
                search: debouncedSearch || undefined,
                category: filterCategory !== 'all' ? filterCategory : undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                sort: sortBy,
                direction: sortOrder
            }
            // Using generic api client if pagination meta differs from productService wrapper
            const resp = await api.products.getAll(params)
            const data = resp.data
            const rawItems = Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : [])
            const items = rawItems.map(r => normalizeProduct(r))
            setProducts(items)
            // Try to extract meta counts
            const meta = data.meta || data.pagination || null
            if (meta) {
                setTotal(meta.total || meta.count || items.length)
            } else {
                setTotal(items.length)
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Erreur chargement produits'
            setError(msg)
            console.error(msg, err)
        } finally {
            setLoading(false)
        }
    }, [page, perPage, debouncedSearch, filterCategory, filterStatus, sortBy, sortOrder])

    const computeStatusFromStock = (stock, current) => {
        if (stock <= 0) return 'out_of_stock'
        if (stock < 5) return 'low_stock'
        // si ancien statut explicitement inactif on le conserve (permet de garder des produits désactivés)
        if (current === 'inactive') return 'inactive'
        return 'active'
    }

    const normalizeProduct = (raw) => {
        if (!raw || typeof raw !== 'object') return {}
        const stock = Number(raw.stock ?? raw.quantity ?? raw.available_stock ?? raw.inventory ?? 0)
        const category = typeof raw.category === 'object' ? (raw.category?.name || raw.category?.title || raw.category?.slug || '') : (raw.category || '')
        let status = raw.status || ''
        status = computeStatusFromStock(stock, status)
        return {
            id: raw.id,
            name: raw.name || raw.title || '',
            category,
            price: Number(raw.price ?? raw.amount ?? 0),
            stock,
            status,
            description: raw.description || raw.short_description || '',
            image: raw.image || raw.thumbnail || raw.cover || '',
            rating: Number(raw.rating ?? raw.average_rating ?? 0).toFixed(1),
            sales: Number(raw.sales ?? raw.total_sales ?? 0)
        }
    }

    const loadCategories = useCallback(async () => {
        try {
            if (categoryService?.getCategories) {
                const res = await categoryService.getCategories()
                if (res.success) setCategoriesList(res.data.data || res.data)
            }
        } catch { /* silent */ }
    }, [])

    useEffect(() => { fetchProducts() }, [fetchProducts])
    useEffect(() => { loadCategories() }, [loadCategories])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XAF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800'
            case 'out_of_stock': return 'bg-red-100 text-red-800'
            case 'low_stock': return 'bg-yellow-100 text-yellow-800'
            case 'inactive': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case 'active': return 'Actif'
            case 'out_of_stock': return 'Rupture'
            case 'low_stock': return 'Stock faible'
            case 'inactive': return 'Inactif'
            default: return status
        }
    }

    // Si l'API ne trie pas, fallback tri local
    const filteredProducts = useMemo(() => {
        const arr = Array.isArray(products) ? [...products] : []
        if (!arr.length) return arr
        if (!arr.some(p => Object.prototype.hasOwnProperty.call(p, sortBy))) return arr
        return arr.sort((a,b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]
            if (['price','stock','sales'].includes(sortBy)) { aVal = Number(aVal); bVal = Number(bVal) }
            if (sortOrder === 'asc') return aVal > bVal ? 1 : -1
            return aVal < bVal ? 1 : -1
        })
    }, [products, sortBy, sortOrder])

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const SortButton = ({ field, children }) => (
        <button
            onClick={() => handleSort(field)}
            className="flex items-center space-x-1 text-left font-medium text-gray-700 hover:text-soni-navy transition-colors"
        >
            <span>{children}</span>
            {sortBy === field && (
                sortOrder === 'asc' ? 
                <ChevronUpIcon className="h-4 w-4" /> : 
                <ChevronDownIcon className="h-4 w-4" />
            )}
        </button>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-soni-orange to-accent-700 rounded-lg flex items-center justify-center mr-3">
                            <ShoppingBagIcon className="h-5 w-5 text-white" />
                        </div>
                        Gestion des Produits
                    </h1>
                    <p className="text-gray-600 mt-1">Gérez votre catalogue de produits SoniShop</p>
                    {error && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
                            {error}
                        </div>
                    )}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setFormMode('create'); setFormData({ name:'', category:'', price:'', stock:'', status:'active', description:'', image:'' }); setShowFormModal(true) }}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-soni-orange to-accent-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> Produit
                    </button>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                        <PlusIcon className="h-4 w-4 mr-2 text-soni-orange" /> Catégorie
                    </button>
                    <button
                        onClick={() => setShowCategoriesManager(true)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                        Gérer Catégories
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Produits</p>
                            <p className="text-xl font-bold text-gray-900">{loading ? '...' : total}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Produits Actifs</p>
                            <p className="text-xl font-bold text-green-600">
                                {loading ? '...' : products.filter(p => p.status === 'active').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <EyeIcon className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Rupture Stock</p>
                            <p className="text-xl font-bold text-red-600">
                                {loading ? '...' : products.filter(p => p.status === 'out_of_stock').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrashIcon className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Valeur Stock</p>
                            <p className="text-xl font-bold text-soni-orange">
                                {loading ? '...' : formatPrice(products.reduce((sum, p) => sum + ((Number(p.price)||0) * (Number(p.stock)||0)), 0))}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">₣</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(1) }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat === 'all' ? 'Toutes les catégories' : cat}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'Tous les statuts' : getStatusText(status)}
                            </option>
                        ))}
                    </select>
                    <button onClick={fetchProducts} disabled={loading} className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Rafraîchir
                    </button>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="name">Produit</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="category">Catégorie</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="price">Prix</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="stock">Stock</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="sales">Ventes</SortButton>
                                </th>
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="status">Statut</SortButton>
                                </th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">Chargement des produits...</td>
                                </tr>
                            )}
                            {!loading && !filteredProducts.length && (
                                <tr>
                                    <td colSpan={7} className="p-0">
                                        <EmptyState 
                                            type="products"
                                            onAction={() => setShowCreateModal(true)}
                                        />
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img 
                                                className="h-12 w-12 rounded-lg object-cover shadow-sm" 
                                                src={product.image} 
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                    e.target.nextSibling.style.display = 'flex'
                                                }}
                                            />
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 items-center justify-center hidden">
                                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.description}</div>
                                                <div className="flex items-center mt-1">
                                                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-500 ml-1">{product.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatPrice(product.price)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.stock} unités</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{product.sales} ventes</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                                            {getStatusText(product.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={()=> { setSelectedProduct(product); setFormMode('view'); setFormData({ name:product.name||'', category: typeof product.category==='object'? (product.category.name||'') : product.category||'', price:product.price??'', stock:product.stock??'', status:product.status||'active', description:product.description||'', image:product.image||'' }); setShowFormModal(true) }} className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={()=> { setSelectedProduct(product); setFormMode('edit'); setFormData({ name:product.name||'', category: typeof product.category==='object'? (product.category.name||'') : product.category||'', price:product.price??'', stock:product.stock??'', status:product.status||'active', description:product.description||'', image:product.image||'' }); setShowFormModal(true) }} className="text-soni-orange hover:text-accent-700 p-1 rounded transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={()=> { setSelectedProduct(product); setShowDeleteConfirm(true) }} className="text-red-600 hover:text-red-800 p-1 rounded transition-colors">
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        {loading ? 'Chargement...' : (
                            <>Page <span className="font-medium">{page}</span> sur <span className="font-medium">{Math.max(1, Math.ceil(total / perPage))}</span> • {total} produits</>
                        )}
                    </div>
                    <div className="flex space-x-2">
                        <button disabled={page<=1 || loading} onClick={()=> setPage(p=> Math.max(1, p-1))} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-40">Précédent</button>
                        <select value={perPage} onChange={e=> { setPerPage(Number(e.target.value)); setPage(1) }} className="px-2 py-1 border border-gray-300 rounded text-sm">
                            {[10,20,50].map(n=> <option key={n} value={n}>{n}/page</option>)}
                        </select>
                        <button disabled={page >= Math.ceil(total / perPage) || loading} onClick={()=> setPage(p=> p+1)} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-40">Suivant</button>
                    </div>
                </div>
            </div>
            {/* Modal Form */}
            {showFormModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
                        <form onSubmit={async (e)=> {
                            e.preventDefault()
                            if (formMode==='view') { setShowFormModal(false); return }
                            setSaving(true)
                            try {
                                const payload = { ...formData }
                                // tentative de mapping category -> category_id
                                const found = categoriesList.find(c => (c.name||c.title||c.slug) === payload.category)
                                if (found?.id) payload.category_id = found.id
                                // statut toujours dérivé du stock sauf si utilisateur a conservé 'inactive'
                                if (payload.status !== 'inactive') {
                                    payload.status = computeStatusFromStock(Number(payload.stock||0), payload.status)
                                }
                                if (formMode==='create') await api.products.create(payload)
                                if (formMode==='edit' && selectedProduct) await api.products.update(selectedProduct.id, payload)
                                setShowFormModal(false)
                                await fetchProducts()
                            } catch(err) {
                                console.error('Erreur sauvegarde', err)
                                alert(err.response?.data?.message || 'Erreur sauvegarde produit')
                            } finally { setSaving(false) }
                        }} className="flex flex-col max-h-[90vh] text-sm">
                            <div className="flex items-center justify-between px-5 py-4 border-b">
                                <h3 className="font-semibold text-gray-800">
                                    {formMode==='create' && 'Nouveau produit'}
                                    {formMode==='edit' && 'Modifier produit'}
                                    {formMode==='view' && 'Détails produit'}
                                </h3>
                                <button type="button" onClick={()=> setShowFormModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <div className="p-5 space-y-5 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 text-gray-600">Nom *</label>
                                        <input required disabled={formMode==='view'} value={formData.name} onChange={e=> setFormData(f=> ({...f, name:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-gray-600">Catégorie</label>
                                        <select disabled={formMode==='view'} value={formData.category} onChange={e=> setFormData(f=> ({...f, category:e.target.value}))} className="w-full border rounded px-3 py-2">
                                            <option value="">-- Choisir --</option>
                                            {categories.filter(c=> c!=='all').map(c=> <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block mb-1 text-gray-600">Prix (XAF)</label>
                                        <input type="number" min="0" disabled={formMode==='view'} value={formData.price} onChange={e=> setFormData(f=> ({...f, price:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-gray-600">Stock</label>
                                        <input type="number" min="0" disabled={formMode==='view'} value={formData.stock} onChange={e=> {
                                            const v = e.target.value
                                            setFormData(f=> {
                                                const stockNum = Number(v)
                                                const nextStatus = f.status === 'inactive' ? 'inactive' : computeStatusFromStock(stockNum, f.status)
                                                return { ...f, stock: v, status: nextStatus }
                                            })
                                        }} className="w-full border rounded px-3 py-2" />
                                        <p className="mt-1 text-xs text-gray-500">Statut ajusté automatiquement selon le stock.</p>
                                    </div>
                                    <div>
                                        <label className="block mb-1 text-gray-600">Statut dérivé</label>
                                        <div className="w-full border rounded px-3 py-2 bg-gray-50 flex items-center justify-between text-sm">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}>
                                                {getStatusText(formData.status)}
                                            </span>
                                            {formMode!=='view' && (
                                                <button type="button" onClick={() => setFormData(f=> ({...f, status: f.status === 'inactive' ? computeStatusFromStock(Number(f.stock||0), 'active') : 'inactive'}))} className="text-xs text-gray-600 underline ml-2">
                                                    {formData.status === 'inactive' ? 'Réactiver auto' : 'Forcer inactif'}
                                                </button>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">Règles: 0 → Rupture, &lt;5 → Stock faible, sinon Actif. Vous pouvez forcer Inactif.</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-1 text-gray-600">Description</label>
                                    <textarea rows={4} disabled={formMode==='view'} value={formData.description} onChange={e=> setFormData(f=> ({...f, description:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-gray-600">Image (URL)</label>
                                    <input disabled={formMode==='view'} value={formData.image} onChange={e=> setFormData(f=> ({...f, image:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                    {formData.image && <img src={formData.image} alt="preview" className="mt-2 h-20 w-20 object-cover rounded border" onError={e=> e.currentTarget.style.display='none'} />}
                                </div>
                            </div>
                            <div className="px-5 py-4 border-t flex justify-end gap-2 bg-gray-50">
                                <button type="button" onClick={()=> setShowFormModal(false)} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Fermer</button>
                                {formMode !== 'view' && <button disabled={saving} type="submit" className="px-3 py-2 text-sm rounded bg-soni-navy text-white disabled:opacity-50">{saving ? 'Enregistrement...' : formMode==='create' ? 'Créer' : 'Enregistrer'}</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-5 text-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Supprimer le produit</h4>
                        <p className="text-gray-600 mb-4">Confirmer la suppression de <span className="font-medium">{selectedProduct?.name}</span> ?</p>
                        <div className="flex justify-end gap-2">
                            <button disabled={deleting} onClick={()=> setShowDeleteConfirm(false)} className="px-3 py-2 border rounded bg-white hover:bg-gray-50">Annuler</button>
                            <button disabled={deleting} onClick={async () => { setDeleting(true); try { await api.products.delete(selectedProduct.id); setShowDeleteConfirm(false); setSelectedProduct(null); await fetchProducts() } catch(err){ console.error(err); alert('Erreur suppression') } finally { setDeleting(false) } }} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{deleting ? 'Suppression...' : 'Supprimer'}</button>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <form onSubmit={async e=> { e.preventDefault(); setSavingCategory(true); try { await api.categories.create(categoryForm); setShowCategoryModal(false); setCategoryForm({ name:'', description:'' }); await loadCategories() } catch(err){ console.error(err); alert(err.response?.data?.message || 'Erreur création catégorie') } finally { setSavingCategory(false) } }} className="flex flex-col text-sm">
                            <div className="px-5 py-4 border-b flex items-center justify-between">
                                <h3 className="font-semibold text-gray-800">Nouvelle catégorie</h3>
                                <button type="button" onClick={()=> setShowCategoryModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                            </div>
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="block mb-1 text-gray-600">Nom *</label>
                                    <input required value={categoryForm.name} onChange={e=> setCategoryForm(f=> ({...f, name:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                </div>
                                <div>
                                    <label className="block mb-1 text-gray-600">Description</label>
                                    <textarea rows={3} value={categoryForm.description} onChange={e=> setCategoryForm(f=> ({...f, description:e.target.value}))} className="w-full border rounded px-3 py-2" />
                                </div>
                            </div>
                            <div className="px-5 py-4 border-t bg-gray-50 flex justify-end gap-2">
                                <button type="button" onClick={()=> setShowCategoryModal(false)} className="px-3 py-2 text-sm border rounded bg-white hover:bg-gray-50">Annuler</button>
                                <button disabled={savingCategory} type="submit" className="px-3 py-2 text-sm rounded bg-soni-navy text-white disabled:opacity-50">{savingCategory ? 'Création...' : 'Créer'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showCategoriesManager && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl text-sm flex flex-col max-h-[90vh]">
                        <div className="px-5 py-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Gestion des catégories</h3>
                            <button type="button" onClick={()=> setShowCategoriesManager(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="p-5 overflow-y-auto space-y-4">
                            {!categoriesList.length && <div className="text-gray-500">Aucune catégorie</div>}
                            {categoriesList.map(cat => {
                                const id = cat.id
                                const draft = categoryEdits[id] || { name: cat.name || cat.title || cat.slug || '', description: cat.description || '' }
                                const changed = draft.name !== (cat.name||cat.title||cat.slug||'') || (draft.description||'') !== (cat.description||'')
                                return (
                                    <div key={id || cat.name} className="border rounded-lg p-4 bg-white shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-1 text-gray-600">Nom</label>
                                                <input value={draft.name} onChange={e=> setCategoryEdits(ed=> ({...ed, [id]: { ...draft, name: e.target.value }}))} className="w-full border rounded px-3 py-2" />
                                            </div>
                                            <div>
                                                <label className="block mb-1 text-gray-600">Description</label>
                                                <input value={draft.description} onChange={e=> setCategoryEdits(ed=> ({...ed, [id]: { ...draft, description: e.target.value }}))} className="w-full border rounded px-3 py-2" />
                                            </div>
                                        </div>
                                        <div className="mt-3 flex justify-end gap-2">
                                            <button
                                                disabled={draft.saving}
                                                onClick={async ()=> {
                                                    if(!id) return
                                                    if(!changed) return
                                                    setCategoryEdits(ed=> ({...ed, [id]: { ...draft, saving: true }}))
                                                    try {
                                                        await apiClient.put(E.admin.categories.detail(id), { name: draft.name, description: draft.description })
                                                        await loadCategories()
                                                    } catch(err) { console.error(err); alert('Erreur mise à jour catégorie') }
                                                    finally {
                                                        setCategoryEdits(ed=> ({...ed, [id]: { ...draft, saving: false }}))
                                                    }
                                                }}
                                                className={`px-3 py-1 rounded text-xs font-medium border ${changed ? 'bg-soni-navy text-white' : 'bg-gray-100 text-gray-500'} disabled:opacity-50`}
                                            >{draft.saving ? '...' : 'Enregistrer'}</button>
                                            <button
                                                disabled={draft.deleting}
                                                onClick={async ()=> {
                                                    if(!id) return
                                                    if(!window.confirm('Supprimer cette catégorie ?')) return
                                                    setCategoryEdits(ed=> ({...ed, [id]: { ...draft, deleting: true }}))
                                                    try {
                                                        await apiClient.delete(E.admin.categories.detail(id))
                                                        await loadCategories()
                                                    } catch(err) { console.error(err); alert('Erreur suppression catégorie') }
                                                    finally { setCategoryEdits(ed=> ({...ed, [id]: { ...draft, deleting: false }})) }
                                                }}
                                                className="px-3 py-1 rounded text-xs font-medium border bg-red-50 text-red-600 disabled:opacity-50"
                                            >{draft.deleting ? '...' : 'Supprimer'}</button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="px-5 py-4 border-t bg-gray-50 flex justify-end">
                            <button onClick={()=> setShowCategoriesManager(false)} className="px-4 py-2 rounded border bg-white hover:bg-gray-50 text-sm">Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsManagement
