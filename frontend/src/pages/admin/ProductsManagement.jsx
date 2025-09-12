import React, { useState, useEffect, useCallback, useMemo } from 'react'
import EmptyState from '../../components/admin/EmptyState'
import ImageUploader from '../../components/ImageUploader'
import CategoriesManager from '../../components/CategoriesManager'
import { useToast } from '../../context/ToastContext'
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
import { categoryService as categoryAPI } from '../../api/categoryService'
import { api, apiClient } from '../../api/client'
import { normalizeProduct } from '../../api/normalizers'
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
    const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '', status: 'active', description: '', image: '', images: [] })
    const [saving, setSaving] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [showCategoriesManager, setShowCategoriesManager] = useState(false)
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' })
    const [savingCategory, setSavingCategory] = useState(false)
    const [categoryEdits, setCategoryEdits] = useState({}) // id -> { name, description, saving }
    const { success: showSuccess, error: showError, info: showInfo } = useToast()

    // Debounce local sans hook externe pour éviter fichier supplémentaire
    const [debouncedSearch, setDebouncedSearch] = useState('')
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchTerm), 400)
        return () => clearTimeout(t)
    }, [searchTerm])

    const categories = useMemo(() => ['all', ...categoriesList.map(c => c.name || c.title || c.slug)].filter((v, i, a) => a.indexOf(v) === i), [categoriesList])
    const statuses = ['all', 'active', 'out_of_stock', 'low_stock', 'inactive']

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        setError(null)
        const params = {
            page,
            per_page: perPage,
            search: debouncedSearch || undefined,
            category: filterCategory !== 'all' ? filterCategory : undefined,
            status: filterStatus !== 'all' ? filterStatus : undefined,
            sort: sortBy,
            direction: sortOrder
        }

        try {
            const result = await productService.getProducts(params)
            if (!result.success) {
                setError(result.error || 'Erreur chargement produits')
                setProducts([])
                return
            }
            // Nouveau format normalisé: result.data = { items, pagination, raw }
            const { items = [], pagination } = result.data || {}
            setProducts(items.map(p => normalizeProduct(p)))

            if (pagination) {
                setTotal(pagination.total || items.length)
                if (pagination.current_page && page !== pagination.current_page) {
                    setPage(pagination.current_page)
                }
                if (pagination.per_page && perPage !== pagination.per_page) {
                    setPerPage(pagination.per_page)
                }
            } else {
                setTotal(items.length)
            }
        } catch (err) {
            console.error('Admin produits fetch error:', err)
            setError('Erreur lors du chargement des produits')
            setProducts([])
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

    // normalizeProduct désormais importé depuis normalizers (ajoute status/stock etc.)

    const loadCategories = useCallback(async () => {
        const result = await categoryAPI.getCategories()
        if (result.success) {
            const cats = result.data || []
            setCategoriesList(Array.isArray(cats) ? cats : [])
        }
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
        return arr.sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]
            if (['price', 'stock', 'sales'].includes(sortBy)) { aVal = Number(aVal); bVal = Number(bVal) }
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
                        onClick={() => { setFormMode('create'); setFormData({ name: '', category: '', price: '', stock: '', status: 'active', description: '', image: '', images: [] }); setShowFormModal(true) }}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" /> Produit
                    </button>
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                    >
                        <PlusIcon className="h-4 w-4 mr-2 text-soni-orange" /> Catégorie
                    </button>
                    <button
                        onClick={() => setShowCategoriesManager(true)}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
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
                                {loading ? '...' : products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0)}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                            <span className="text-orange-600 font-bold">F cfa</span>
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
                                            {/* Mini galerie d'images */}
                                            <div className="flex items-center space-x-1" title={product.images && product.images.length > 0 ? `${product.images.length} image${product.images.length > 1 ? 's' : ''}` : product.image ? '1 image' : 'Aucune image'}>
                                                {product.images && product.images.length > 0 ? (
                                                    <>
                                                        {/* Première image (principale) plus grande */}
                                                        <div className="relative">
                                                            <img
                                                                className="h-12 w-12 rounded-lg object-cover shadow-sm border-2 border-soni-orange/20"
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none'
                                                                    e.target.nextSibling.style.display = 'flex'
                                                                }}
                                                            />
                                                            <div className="h-12 w-12 rounded-lg bg-gray-100 items-center justify-center hidden">
                                                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                                                            </div>
                                                            {product.images.length > 1 && (
                                                                <div className="absolute -top-1 -right-1 bg-soni-orange text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shadow">
                                                                    {product.images.length}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Miniatures des images supplémentaires (max 3) */}
                                                        {product.images.slice(1, 4).map((imageUrl, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    className="h-8 w-8 rounded-md object-cover shadow-sm opacity-75 hover:opacity-100 transition-opacity"
                                                                    src={imageUrl}
                                                                    alt={`${product.name} ${index + 2}`}
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none'
                                                                        e.target.nextSibling.style.display = 'flex'
                                                                    }}
                                                                />
                                                                <div className="h-8 w-8 rounded-md bg-gray-100 items-center justify-center hidden">
                                                                    <PhotoIcon className="h-3 w-3 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        
                                                        {/* Indicateur s'il y a plus de 4 images */}
                                                        {product.images.length > 4 && (
                                                            <div className="h-8 w-8 rounded-md bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium">
                                                                +{product.images.length - 4}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : product.image ? (
                                                    /* Fallback vers image unique */
                                                    <div className="relative">
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
                                                    </div>
                                                ) : (
                                                    /* Pas d'image */
                                                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                                        <PhotoIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
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
                                            <button onClick={() => { setSelectedProduct(product); setFormMode('view'); setFormData({ name: product.name || '', category: typeof product.category === 'object' ? (product.category.name || '') : product.category || '', price: product.price ?? '', stock: product.stock ?? '', status: product.status || 'active', description: product.description || '', image: product.image || '', images: product.images || [] }); setShowFormModal(true) }} className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { setSelectedProduct(product); setFormMode('edit'); setFormData({ name: product.name || '', category: typeof product.category === 'object' ? (product.category.name || '') : product.category || '', price: product.price ?? '', stock: product.stock ?? '', status: product.status || 'active', description: product.description || '', image: product.image || '', images: product.images || [] }); setShowFormModal(true) }} className="text-soni-orange hover:text-accent-700 p-1 rounded transition-colors">
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => { setSelectedProduct(product); setShowDeleteConfirm(true) }} className="text-red-600 hover:text-red-800 p-1 rounded transition-colors">
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
                        <button disabled={page <= 1 || loading} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-40">Précédent</button>
                        <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }} className="px-2 py-1 border border-gray-300 rounded text-sm">
                            {[10, 20, 50].map(n => <option key={n} value={n}>{n}/page</option>)}
                        </select>
                        <button disabled={page >= Math.ceil(total / perPage) || loading} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors disabled:opacity-40">Suivant</button>
                    </div>
                </div>
            </div>
            {/* Modal Form - Modernisé */}
            {showFormModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300 flex flex-col *:ring-2">
                        <form onSubmit={async (e) => {
                            e.preventDefault()
                            if (formMode === 'view') { setShowFormModal(false); return }
                            setSaving(true)
                            try {
                                const payload = { ...formData }
                                // tentative de mapping category -> category_id
                                const found = categoriesList.find(c => (c.name || c.title || c.slug) === payload.category)
                                if (found?.id) payload.category_id = found.id
                                // statut toujours dérivé du stock sauf si utilisateur a conservé 'inactive'
                                if (payload.status !== 'inactive') {
                                    payload.status = computeStatusFromStock(Number(payload.stock || 0), payload.status)
                                }
                                if (formMode === 'create') await api.products.create(payload)
                                if (formMode === 'edit' && selectedProduct) await api.products.update(selectedProduct.id, payload)
                                setShowFormModal(false)
                                await fetchProducts()
                                const action = formMode === 'create' ? 'créé' : 'modifié'
                                showSuccess(`Produit ${action} avec succès !`)
                            } catch (err) {
                                console.error('Erreur sauvegarde', err)
                                const message = err.response?.data?.message || 'Erreur sauvegarde produit'
                                showError(`Erreur: ${message}`)
                            } finally { setSaving(false) }
                        }} className="flex flex-col h-full">
                            {/* Header avec gradient */}
                            <div className={`flex items-center justify-between px-6 py-5 text-white ${formMode === 'view' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 'bg-blue-600 to-soni-orange'
                                }`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${formMode === 'create' ? 'bg-white/20' :
                                            formMode === 'edit' ? 'bg-white/20' : 'bg-white/20'
                                        }`}>
                                        {formMode === 'create' && <PlusIcon className="h-5 w-5 text-white" />}
                                        {formMode === 'edit' && <PencilIcon className="h-5 w-5 text-white" />}
                                        {formMode === 'view' && <EyeIcon className="h-5 w-5 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">
                                            {formMode === 'create' && 'Nouveau produit'}
                                            {formMode === 'edit' && 'Modifier produit'}
                                            {formMode === 'view' && 'Détails produit'}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {formMode === 'create' && 'Ajoutez un nouveau produit au catalogue'}
                                            {formMode === 'edit' && 'Modifiez les informations du produit'}
                                            {formMode === 'view' && 'Consultez les détails du produit'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFormModal(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenu avec scroll */}
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                {formMode === 'view' ? (
                                    /* ===== MODE CONSULTATION ===== */
                                    <div className="p-6 space-y-6">
                                        {/* Galerie d'images */}
                                        {((formData.images && formData.images.length > 0) || formData.image) && (
                                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                                                        <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                            <PhotoIcon className="h-4 w-4 text-purple-600" />
                                                        </div>
                                                        {formData.images && formData.images.length > 0 
                                                            ? `Galerie d'images (${formData.images.length})`
                                                            : 'Image du produit'
                                                        }
                                                    </h4>
                                                    <button
                                                        onClick={() => setFormMode('edit')}
                                                        className="px-3 py-1.5 bg-soni-orange text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium flex items-center space-x-1"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                        <span>Gérer</span>
                                                    </button>
                                                </div>
                                                
                                                {formData.images && formData.images.length > 0 ? (
                                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {formData.images.map((imageUrl, index) => (
                                                            <div key={index} className="relative group cursor-pointer">
                                                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-soni-orange/30 transition-all">
                                                                    <img
                                                                        src={imageUrl}
                                                                        alt={`${formData.name} ${index + 1}`}
                                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none'
                                                                            e.target.nextSibling.style.display = 'flex'
                                                                        }}
                                                                    />
                                                                    <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                                                                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Badge image principale */}
                                                                {index === 0 && (
                                                                    <div className="absolute top-2 left-2 bg-gradient-to-r from-soni-orange to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                                                                        ★ Principale
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Overlay avec actions au hover */}
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                    <div className="flex space-x-2">
                                                                        {index !== 0 && (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    // Déplacer cette image en première position
                                                                                    const newImages = [...formData.images]
                                                                                    const imageToMove = newImages.splice(index, 1)[0]
                                                                                    newImages.unshift(imageToMove)
                                                                                    setFormData(f => ({
                                                                                        ...f,
                                                                                        images: newImages,
                                                                                        image: newImages[0]
                                                                                    }))
                                                                                    showSuccess('Image définie comme principale')
                                                                                }}
                                                                                className="p-2 bg-soni-orange text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg"
                                                                                title="Définir comme image principale"
                                                                            >
                                                                                <StarIcon className="h-4 w-4" />
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation()
                                                                                // Supprimer cette image
                                                                                const newImages = formData.images.filter((_, i) => i !== index)
                                                                                setFormData(f => ({
                                                                                    ...f,
                                                                                    images: newImages,
                                                                                    image: newImages[0] || ''
                                                                                }))
                                                                                showSuccess('Image supprimée')
                                                                            }}
                                                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                                                            title="Supprimer cette image"
                                                                        >
                                                                            <TrashIcon className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Numéro de position */}
                                                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                                                                    {index + 1}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : formData.image && (
                                                    <div className="max-w-md mx-auto">
                                                        <div className="relative group">
                                                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                                                <img
                                                                    src={formData.image}
                                                                    alt={formData.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none'
                                                                        e.target.nextSibling.style.display = 'flex'
                                                                    }}
                                                                />
                                                                <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                                                                    <PhotoIcon className="h-12 w-12 text-gray-400" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Info et conseils */}
                                                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-700">
                                                        <span className="font-medium">💡 Astuce:</span> 
                                                        Survolez les images pour définir l'image principale (★) ou supprimer (🗑️). 
                                                        Cliquez "Gérer" pour ajouter/réorganiser.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Informations principales */}
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <ShoppingBagIcon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Informations du produit
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Nom du produit</label>
                                                        <p className="mt-1 text-lg font-semibold text-gray-900">{formData.name || 'Non défini'}</p>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Catégorie</label>
                                                        <p className="mt-1 text-base text-gray-900">
                                                            {formData.category ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                                    {formData.category}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-500">Non définie</span>
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Statut</label>
                                                        <p className="mt-1">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(formData.status)}`}>
                                                                {getStatusText(formData.status)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Prix</label>
                                                        <p className="mt-1 text-2xl font-bold text-soni-orange">
                                                            {formData.price ? `${parseInt(formData.price).toLocaleString()} XAF` : 'Non défini'}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Stock disponible</label>
                                                        <p className="mt-1 text-lg font-semibold text-gray-900">
                                                            {formData.stock || '0'} unité{(formData.stock && formData.stock !== '1') ? 's' : ''}
                                                        </p>
                                                        {formData.stock && parseInt(formData.stock) < 5 && parseInt(formData.stock) > 0 && (
                                                            <p className="mt-1 text-sm text-orange-600 font-medium">⚠️ Stock faible</p>
                                                        )}
                                                        {(!formData.stock || parseInt(formData.stock) === 0) && (
                                                            <p className="mt-1 text-sm text-red-600 font-medium">❌ Rupture de stock</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        {formData.description && (
                                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                        <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                                                        </svg>
                                                    </div>
                                                    Description
                                                </h4>
                                                <div className="prose prose-sm max-w-none">
                                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Actions rapides */}
                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h4>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => {
                                                        setFormMode('edit')
                                                    }}
                                                    className="flex items-center px-4 py-2 bg-soni-orange text-white rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm"
                                                >
                                                    <PencilIcon className="h-4 w-4 mr-2" />
                                                    Modifier ce produit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(formData)
                                                        setShowFormModal(false)
                                                        setShowDeleteConfirm(true)
                                                    }}
                                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-2" />
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* ===== MODE CRÉATION/MODIFICATION ===== */
                                    <div className="p-6 space-y-6">
                                        {/* Informations de base */}
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                    <ShoppingBagIcon className="h-4 w-4 text-blue-600" />
                                                </div>
                                                Informations générales
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                                                    <input
                                                        required
                                                        value={formData.name}
                                                        onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors"
                                                        placeholder="Ex: iPhone 15 Pro Max"
                                                    />
                                                </div>
                                                <div className="col-span-2 sm:col-span-1">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                                                    <select
                                                        value={formData.category}
                                                        onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors"
                                                    >
                                                        <option value="">Sélectionner une catégorie</option>
                                                        {categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Prix et stock */}
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                    <span className="text-green-600 font-bold text-sm">₣</span>
                                                </div>
                                                Prix et inventaire
                                            </h4>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Prix (XAF) *</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={formData.price}
                                                            onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors pl-8"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute left-3 top-3.5 text-gray-400 text-sm">₣</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={formData.stock}
                                                        onChange={e => {
                                                            const v = e.target.value
                                                            setFormData(f => {
                                                                const stockNum = Number(v)
                                                                const nextStatus = f.status === 'inactive' ? 'inactive' : computeStatusFromStock(stockNum, f.status)
                                                                return { ...f, stock: v, status: nextStatus }
                                                            })
                                                        }}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors"
                                                        placeholder="0"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">Statut ajusté automatiquement selon le stock</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                                    <div className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 flex items-center justify-between">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(formData.status)}`}>
                                                            {getStatusText(formData.status)}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setFormData(f => ({ ...f, status: f.status === 'inactive' ? computeStatusFromStock(Number(f.stock || 0), 'active') : 'inactive' }))}
                                                            className="text-xs text-soni-orange hover:text-accent-700 font-medium transition-colors"
                                                        >
                                                            {formData.status === 'inactive' ? 'Réactiver' : 'Désactiver'}
                                                        </button>
                                                    </div>
                                                    <p className="mt-1 text-xs text-gray-500">Auto: 0 → Rupture, &lt;5 → Faible, sinon Actif</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Description et image */}
                                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                                    <PhotoIcon className="h-4 w-4 text-purple-600" />
                                                </div>
                                                Détails et médias
                                            </h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                                    <textarea
                                                        rows={4}
                                                        value={formData.description}
                                                        onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors resize-none"
                                                        placeholder="Description du produit..."
                                                    />
                                                </div>
                                                <div>
                                                    {/* Galerie de gestion des images */}
                                                    {formData.images && formData.images.length > 0 && (
                                                        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                            <h5 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                                                                <PhotoIcon className="h-4 w-4 mr-2 text-purple-600" />
                                                                Images actuelles ({formData.images.length}/10)
                                                                <span className="ml-auto text-xs text-gray-500">Cliquez et glissez pour réorganiser</span>
                                                            </h5>
                                                            <div 
                                                                className="grid grid-cols-3 md:grid-cols-5 gap-3"
                                                                onDragOver={(e) => e.preventDefault()}
                                                            >
                                                                {formData.images.map((imageUrl, index) => (
                                                                    <div 
                                                                        key={`${imageUrl}-${index}`}
                                                                        className="relative group cursor-move"
                                                                        draggable
                                                                        onDragStart={(e) => {
                                                                            e.dataTransfer.setData('text/plain', index.toString())
                                                                            e.currentTarget.style.opacity = '0.5'
                                                                        }}
                                                                        onDragEnd={(e) => {
                                                                            e.currentTarget.style.opacity = '1'
                                                                        }}
                                                                        onDrop={(e) => {
                                                                            e.preventDefault()
                                                                            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'))
                                                                            const targetIndex = index
                                                                            
                                                                            if (draggedIndex !== targetIndex) {
                                                                                const newImages = [...formData.images]
                                                                                const draggedImage = newImages[draggedIndex]
                                                                                newImages.splice(draggedIndex, 1)
                                                                                newImages.splice(targetIndex, 0, draggedImage)
                                                                                
                                                                                setFormData(f => ({
                                                                                    ...f,
                                                                                    images: newImages,
                                                                                    image: newImages[0]
                                                                                }))
                                                                                showSuccess('Images réorganisées')
                                                                            }
                                                                        }}
                                                                    >
                                                                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent group-hover:border-soni-orange/30 transition-all">
                                                                            <img
                                                                                src={imageUrl}
                                                                                alt={`Image ${index + 1}`}
                                                                                className="w-full h-full object-cover"
                                                                                onError={(e) => {
                                                                                    e.target.style.display = 'none'
                                                                                    e.target.nextSibling.style.display = 'flex'
                                                                                }}
                                                                            />
                                                                            <div className="w-full h-full bg-gray-200 hidden items-center justify-center">
                                                                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Badge principal */}
                                                                        {index === 0 && (
                                                                            <div className="absolute top-1 left-1 bg-gradient-to-r from-soni-orange to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow text-center">
                                                                                ★
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Actions */}
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                                            <div className="flex space-x-1">
                                                                                {index !== 0 && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation()
                                                                                            const newImages = [...formData.images]
                                                                                            const imageToMove = newImages.splice(index, 1)[0]
                                                                                            newImages.unshift(imageToMove)
                                                                                            setFormData(f => ({
                                                                                                ...f,
                                                                                                images: newImages,
                                                                                                image: newImages[0]
                                                                                            }))
                                                                                            showSuccess('Image définie comme principale')
                                                                                        }}
                                                                                        className="p-1.5 bg-soni-orange text-white rounded-full hover:bg-orange-600 transition-colors shadow-lg text-xs"
                                                                                        title="Principale"
                                                                                    >
                                                                                        <StarIcon className="h-3 w-3" />
                                                                                    </button>
                                                                                )}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        const newImages = formData.images.filter((_, i) => i !== index)
                                                                                        setFormData(f => ({
                                                                                            ...f,
                                                                                            images: newImages,
                                                                                            image: newImages[0] || ''
                                                                                        }))
                                                                                        showSuccess('Image supprimée')
                                                                                    }}
                                                                                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg text-xs"
                                                                                    title="Supprimer"
                                                                                >
                                                                                    <TrashIcon className="h-3 w-3" />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {/* Numéro */}
                                                                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                                            {index + 1}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                💡 Glissez-déposez pour changer l'ordre • La première image est l'image principale
                                                            </p>
                                                        </div>
                                                    )}

                                                    <ImageUploader
                                                        value={formData.images}
                                                        onChange={(images) => setFormData(f => ({
                                                            ...f,
                                                            images: Array.isArray(images) ? images : [images].filter(Boolean),
                                                            image: Array.isArray(images) ? images[0] || '' : images || ''
                                                        }))}
                                                        multiple={true}
                                                        folder="products"
                                                        maxFiles={10}
                                                        label="Images du produit"
                                                        showPreview={true}
                                                    />

                                                    {/* URL manuelle pour compatibilité */}
                                                    <div className="mt-4">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Ou saisir une URL d'image
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={formData.image}
                                                                onChange={e => setFormData(f => ({ ...f, image: e.target.value }))}
                                                                className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-soni-orange focus:border-soni-orange transition-colors"
                                                                placeholder="https://exemple.com/image.jpg"
                                                            />
                                                            {formData.image && !formData.images.includes(formData.image) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (formData.image && !formData.images.includes(formData.image)) {
                                                                            setFormData(f => ({
                                                                                ...f,
                                                                                images: [...f.images, f.image]
                                                                            }))
                                                                        }
                                                                    }}
                                                                    className="px-3 py-2 bg-soni-orange text-white rounded-xl hover:bg-accent-700 transition-colors text-sm"
                                                                >
                                                                    Ajouter
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer avec actions */}
                            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 rounded-b-2xl">
                                {formMode === 'view' ? (
                                    /* Footer mode consultation */
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowFormModal(false)}
                                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                        >
                                            Fermer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormMode('edit')}
                                            className="px-6 py-2.5 text-sm font-medium bg-soni-orange text-white rounded-xl hover:bg-orange-600 transition-colors flex items-center space-x-2"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                            <span>Modifier</span>
                                        </button>
                                    </>
                                ) : (
                                    /* Footer mode création/modification */
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowFormModal(false)}
                                            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            disabled={saving}
                                            type="submit"
                                            className="cursor-pointer px-6 py-2.5 text-sm font-medium bg-blue-700 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                                        >
                                            {saving && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                            <span>{saving ? 'Enregistrement...' : formMode === 'create' ? 'Créer le produit' : 'Sauvegarder'}</span>
                                        </button>
                                    </>
                                )}
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
                            <button disabled={deleting} onClick={() => setShowDeleteConfirm(false)} className="px-3 py-2 border rounded bg-white hover:bg-gray-50">Annuler</button>
                            <button disabled={deleting} onClick={async () => { setDeleting(true); try { await api.products.delete(selectedProduct.id); showSuccess('Produit supprimé avec succès'); setShowDeleteConfirm(false); setSelectedProduct(null); await fetchProducts() } catch (err) { console.error(err); showError('Erreur lors de la suppression') } finally { setDeleting(false) } }} className="px-3 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">{deleting ? 'Suppression...' : 'Supprimer'}</button>
                        </div>
                    </div>
                </div>
            )}
            {showCategoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <form onSubmit={async e => {
                            e.preventDefault();
                            setSavingCategory(true);
                            try {
                                await api.categories.create(categoryForm);
                                setShowCategoryModal(false);
                                setCategoryForm({ name: '', description: '', image: '' });
                                await loadCategories();
                                showSuccess(`Catégorie "${categoryForm.name}" créée avec succès !`)
                            } catch (err) {
                                console.error(err);
                                showError(`Erreur: ${err.response?.data?.message || 'Erreur création catégorie'}`)
                            } finally {
                                setSavingCategory(false)
                            }
                        }} className="flex flex-col">
                            <div className="px-6 py-4 bg-blue-600 text-white rounded-t-2xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold">Nouvelle Catégorie</h3>
                                    <button type="button" onClick={() => setShowCategoryModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la catégorie *</label>
                                    <input
                                        required
                                        value={categoryForm.name}
                                        onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Smartphones, Laptops..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        rows={3}
                                        value={categoryForm.description}
                                        onChange={e => setCategoryForm(f => ({ ...f, description: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Description de la catégorie..."
                                    />
                                </div>
                                <div>
                                    <ImageUploader
                                        value={categoryForm.image}
                                        onChange={(image) => setCategoryForm(f => ({ ...f, image }))}
                                        folder="categories"
                                        label="Image de la catégorie"
                                        multiple={false}
                                    />
                                </div>
                            </div>
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-2xl">
                                <button type="button" onClick={() => setShowCategoryModal(false)} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    Annuler
                                </button>
                                <button
                                    disabled={savingCategory || !categoryForm.name.trim()}
                                    type="submit"
                                    className="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                                >
                                    {savingCategory && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{savingCategory ? 'Création...' : 'Créer la catégorie'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gestionnaire de catégories moderne */}
            <CategoriesManager
                isOpen={showCategoriesManager}
                onClose={() => setShowCategoriesManager(false)}
                onCategoryCreated={(category) => {
                    loadCategories()
                    showSuccess(`Catégorie "${category.name}" créée avec succès !`)
                }}
                onCategoryUpdated={(category) => {
                    loadCategories()
                    showSuccess(`Catégorie "${category.name}" modifiée avec succès !`)
                }}
                onCategoryDeleted={(categoryId) => {
                    loadCategories()
                    showSuccess(`Catégorie supprimée avec succès !`)
                }}
            />
        </div>
    )
}

export default ProductsManagement
