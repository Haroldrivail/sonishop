import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ProductModal from './utils/ProductModal'
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

const ProductsManagement = () => {
    const [products, setProducts] = useState([])

    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('name')
    const [sortOrder, setSortOrder] = useState('asc')
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('create') // 'create' or 'edit'
    const [selectedProduct, setSelectedProduct] = useState(null)

    const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Tablettes', 'Accessoires']
    const statuses = ['all', 'active', 'out_of_stock', 'low_stock', 'inactive']

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://public.test/api/products');
            const productsWithStatus = response.data.map(p => ({
                ...p,
                status: getStatusFromLogic(p),
            }));
            setProducts(productsWithStatus);
        } catch (error) {
            console.error('Erreur lors du chargement des produits', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);



    const getStatusFromLogic = (product) => {
        const createdAt = new Date(product.created_at)
        const now = new Date()
        const daysSinceCreation = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

        if (product.stock === 0) return 'out_of_stock'
        if (product.stock > 0 && product.stock < 5) return 'low_stock'
        if (daysSinceCreation > 30 && product.sales === 0) return 'inactive'

        return 'active'
    }



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

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = filterCategory === 'all' || product.category === filterCategory
            const matchesStatus = filterStatus === 'all' || product.status === filterStatus
            return matchesSearch && matchesCategory && matchesStatus
        })
        .sort((a, b) => {
            let aVal = a[sortBy]
            let bVal = b[sortBy]

            if (sortBy === 'price' || sortBy === 'stock' || sortBy === 'sales') {
                aVal = Number(aVal)
                bVal = Number(bVal)
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1
            } else {
                return aVal < bVal ? 1 : -1
            }
        })

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

    const handleSaveProduct = (productData) => {
        if (selectedProduct) {
            // Edition d'un produit
            axios.put(`http://public.test/api/products/${selectedProduct.id}`, productData)
                .then(response => {
                    // Mettre à jour la liste des produits avec la nouvelle version
                    setProducts(products.map(p => p.id === selectedProduct.id ? response.data : p));
                    setShowModal(false);
                    setSelectedProduct(null);
                })
                .catch(error => console.error(error));
        } else {
            // Ajout d'un produit
            axios.post('http://public.test/api/products', productData)
                .then(response => {
                    setProducts([...products, response.data]);
                    setShowModal(false);
                })
                .catch(error => console.error(error));
        }
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setModalMode('edit');
        setShowModal(true);
    }

    const handleaddclick = () => {
        setSelectedProduct(null);  // IMPORTANT : pas de produit sélectionné = ajout
        setModalMode('create');
        setShowModal(true);
    }

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

        try {
            await axios.delete(`http://public.test/api/products/${productId}`);
            setProducts(products.filter(p => p.id !== productId));
        } catch (error) {
            console.error('Erreur lors de la suppression', error);
            alert('Une erreur est survenue lors de la suppression.');
        }
    };



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
                </div>
                <button
                    onClick={() => {
                        setSelectedProduct(null);  // IMPORTANT : pas de produit sélectionné = ajout
                        setModalMode('create');
                        setShowModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
                >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter un Produit
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Produits</p>
                            <p className="text-xl font-bold text-gray-900">{products.length}</p>
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
                                {products.filter(p => p.status === 'active').length}
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
                                {products.filter(p => p.status === 'out_of_stock').length}
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
                                {formatPrice(products.reduce((total, p) => total + (p.price * p.stock), 0))}
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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
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
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-soni-orange focus:border-transparent"
                    >
                        {statuses.map(status => (
                            <option key={status} value={status}>
                                {status === 'all' ? 'Tous les statuts' : getStatusText(status)}
                            </option>
                        ))}
                    </select>
                    <button className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filtres avancés
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
                                <th className="px-6 py-3 text-left">
                                    <SortButton field="created_at">Créé le</SortButton>
                                </th>

                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-12 w-12 rounded-lg object-cover shadow-sm"
                                                src={
                                                    product.image?.startsWith('http')
                                                        ? product.image
                                                        : `http://public.test/storage/${product.image}`
                                                }
                                                alt={product.name}
                                            />

                                            <div className="h-12 w-12 rounded-lg bg-gray-100 items-center justify-center hidden">
                                                <PhotoIcon className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.description}</div>
                                                <div className="flex space-x-2 mt-1">
                                                    {product.is_new && (
                                                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                                            Nouveau
                                                        </span>
                                                    )}
                                                    {product.free_shipping && (
                                                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                                            Livraison gratuite
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center mt-1 space-x-1 text-sm text-gray-500">
                                                    <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span>{product.rating}</span>
                                                    {product.reviews !== undefined && (
                                                        <span className="text-gray-400">({product.reviews} avis)</span>
                                                    )}
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
                                            {product.sale_price ? (
                                                <div className="flex flex-col">
                                                    <span className="line-through text-gray-400">{formatPrice(product.price)}</span>
                                                    <span className="text-soni-orange font-bold">{formatPrice(product.sale_price)}</span>
                                                </div>
                                            ) : (
                                                formatPrice(product.price)
                                            )}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.created_at
                                            ? new Date(product.created_at).toLocaleDateString('fr-FR')
                                            : '—'}
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setModalMode('edit');
                                                    setShowModal(true);
                                                }}
                                                className="text-soni-orange hover:text-accent-700 p-1 rounded transition-colors"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                            >
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
                        Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredProducts.length}</span> sur <span className="font-medium">{products.length}</span> produits
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                            Précédent
                        </button>
                        <button className="px-3 py-1 bg-soni-navy text-white rounded-md text-sm hover:bg-soni-navy-dark transition-colors">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>

            {/* exemple d'appel au modal */}
            <ProductModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchProducts}  // <== ici tu utilises la fonction définie
                mode={modalMode}
                initialData={selectedProduct}
            />

        </div>
    )
}

export default ProductsManagement
