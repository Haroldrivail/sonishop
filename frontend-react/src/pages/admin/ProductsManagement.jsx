import React, { useState } from 'react'
import { useEffect } from 'react'; // (au début du fichier si pas encore importé)
import axios from '../../api/axios'
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
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // ⬇️ ICI le useEffect
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/products');
                const data = response.data;
                const fetchedProducts = Array.isArray(data) ? data : data.data;
                setProducts(fetchedProducts);
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    setError("Non autorisé. Veuillez vous reconnecter.");
                } else {
                    setError("Erreur lors de la récupération des produits.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);


    const categories = ['all', 'Smartphones', 'Ordinateurs', 'Audio', 'Tablettes', 'Accessoires']
    const statuses = ['all', 'active', 'out_of_stock', 'low_stock', 'inactive']

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-soni-orange to-accent-700 rounded-lg flex items-center justify-center mr-3">
                            <ShoppingBagIcon className="h-5 w-5 text-white" />
                        </div>
                        Gestion des Produits
                    </h1>
                    <p className="text-gray-600 mt-1">Gérez votre catalogue de produits SoniShop</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-soni-orange to-accent-700 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200"
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
                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
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
                            <p className="text-2xl font-bold text-green-600">
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
                            <p className="text-2xl font-bold text-red-600">
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
                            <p className="text-2xl font-bold text-soni-orange">
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
                                                src={product.image} 
                                                alt={product.name}
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                    e.target.nextSibling.style.display = 'flex'
                                                }}
                                            />
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 items-center justify-center hidden">
                                                <PhotoIcon className="h-6 w-6 text-gray-400 mx-auto" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-gray-900 font-medium">{product.name}</div>
                                                <div className="text-sm text-gray-500">{product.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{product.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-soni-orange">
                                        {formatPrice(product.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{product.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 flex items-center space-x-1">
                                        <StarIcon className="h-4 w-4 text-yellow-400" />
                                        <span>{product.rating}</span>
                                        <span className="text-sm text-gray-400">({product.sales})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
                                            {getStatusText(product.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                        <button
                                            className="text-soni-orange hover:text-soni-navy transition-colors"
                                            title="Modifier"
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="text-red-600 hover:text-red-800 transition-colors"
                                            title="Supprimer"
                                            onClick={() => alert(`Supprimer ${product.name}`)}
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-500">
                                        Aucun produit trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Ajouter ou Modifier (placeholder) */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Ajouter un produit (fonctionnalité à venir)</h2>
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="mt-4 px-4 py-2 bg-soni-orange text-white rounded-lg hover:bg-accent-700"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Modifier (placeholder) */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-lg font-bold mb-4">Modifier le produit (fonctionnalité à venir)</h2>
                        <p className="mb-4">Produit: {selectedProduct.name}</p>
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="mt-4 px-4 py-2 bg-soni-orange text-white rounded-lg hover:bg-accent-700"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsManagement
